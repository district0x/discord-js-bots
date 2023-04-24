import { PineconeClient } from "@pinecone-database/pinecone";
import pkg from 'discord.js';
const { Client, GatewayIntentBits, MessageEmbed, MessageActionRow, MessageButton } = pkg;
import fetch from 'node-fetch';
import { config as dotenvConfig } from 'dotenv';
import * as openai from 'openai';

dotenvConfig();

const pinecone = new PineconeClient();
await pinecone.init({
  environment: "us-east-1-aws",
  apiKey: process.env.PINECONE_API_KEY,
});
console.log(pinecone); // Add this line to check if pinecone is initialized properly

openai.apiKey = 'process.env.OPENAI_API_KEY;'

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('/pinecone')) {
    const query = message.content.substring('/pinecone'.length).trim();
    if (!query) {
      message.channel.send('Please enter your query after the `/pinecone` command.');
      return;
    }

    try {
      const { answer } = await pinecone.interpret({ query });
      message.channel.send(answer);
    } catch (error) {
      console.error('Error querying Pinecone:', error);
      message.channel.send('Sorry, there was an error processing your request.');
    }
  } else {
    try {
      const prompt = `User: ${message.content}\nChatbot:`;
      const response = await openai.completions.create({
        engine: 'davinci',
        prompt,
        maxTokens: 150,
        n: 1,
        stop: ['User:'],
      });

      const messageToSend = response.data.choices[0].text.trim();
      message.channel.send(messageToSend);
    } catch (error) {
      console.error('Error generating ChatGPT response:', error);
      message.channel.send('Sorry, there was an error processing your request.');
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
