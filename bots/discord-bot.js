import { PineconeClient } from "@pinecone-database/pinecone";
import pkg from 'discord.js';
const { Client, GatewayIntentBits, MessageEmbed, MessageActionRow, MessageButton } = pkg;
import fetch from 'node-fetch';
import { config as dotenvConfig } from 'dotenv';
import openai from 'openai';

dotenvConfig();

const pinecone = new PineconeClient();
await pinecone.init({
  environment: "us-east-1-aws",
  apiKey: process.env.PINECONE_API_KEY,
});

console.log(pinecone); // Add this line to check if pinecone is initialized properly

console.log(process.env.OPENAI_API_KEY) 
openai.apiKey = process.env.OPENAI_API_KEY;

const indexName ='ethlancegpt';
let pineconeIndex;

pinecone.listIndexes().then((indexes) => {
  if (indexes.findIndex((index) => index.name === indexName) === -1) {
    pinecone.createIndex(indexName, 1536);
    console.log(`Created Pinecone index ${indexName}`);
  } else {
    console.log(`Pinecone index ${indexName} already exists`);
  }
  pineconeIndex = pinecone.Index(indexName);
});

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

async function getMatchingEmbeddings(prompt) {
  const embeddings = await openai.embed({
    engine: 'text-davinci-002',
    input: [prompt],
  });
  
  if (!embeddings || !embeddings.length) {
    console.error('Error generating embeddings from OpenAI API');
    return;
  }

  if (embeddings.length > 1) {
    console.warn('More than one embedding returned from OpenAI API');
  }

  const embeds = embeddings.map(embedding => embedding.embedding);

  const pineRes = await pineconeIndex.query({
    vector: embeds,
    top_k: 5,
    include_metadata: true,
  });

  const matches = pineRes.data.matches.filter(match => match.score >= minPineconeScore);

  console.log(`User post filtered matches: ${JSON.stringify(matches)}`);
  
  return matches;
}


client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('/pinecone')) {
    const query = message.content.substring('/pinecone'.length).trim();
    if (!query) {
      message.channel.send('Please enter your query after the `/pinecone` command.');
      return;
    }

    try {
      const answer = await queryPinecone(query);
      message.channel.send(answer);
    } catch (error) {
      console.error('Error querying Pinecone:', error);
      message.channel.send('Sorry, there was an error processing your request.');
    }
  } else {
    try {
      const prompt = `User: ${message.content}\nChatbot:`;
      const response = await openai.createCompletion({
        model: "text-davinci-003",   
        prompt: prompt,
        max_tokens: 256,
      });
      const messageToSend = response.choices[0].text.trim();
      message.channel.send(messageToSend);
    } catch (error) {
      console.error('Error generating ChatGPT response:', error);
      message.channel.send('Sorry, there was an error processing your request.');
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);


