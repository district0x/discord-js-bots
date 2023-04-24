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
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
