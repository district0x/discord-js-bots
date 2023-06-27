// Import the Discord.js library
const { Client, GatewayIntentBits } = require("discord.js");
const dotenv = require("dotenv");

const {
  upsertToIndexFromUserInput,
  queryIndexAndGenerateResponse,
} = require("./helpers.js");
dotenv.config();

// Create a new Discord client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Set grumpyCat Object
let grumpyCat = { lastMessageID: null };

// Import the OpenAI library and dependencies
const { Configuration, OpenAIApi } = require("openai");

// Set the configuration for the OpenAI API
const configuration = new Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_KEY,
});

// Initialize OpenAI API
const openai = new OpenAIApi(configuration);

// Conversational Memory
let conversationMemory = [];

// Message Create Listener
client.on("messageCreate", async function (message) {
  console.log("Message received:", message.content);

  try {
    if (message.author.bot) return;

    if (
      message.content.includes("@here") ||
      message.content.includes("@everyone") ||
      message.type == "REPLY"
    )
      return;

    if (message.content.includes(`<@${client.user.id}>`)) {
      let lastMessage = message.content;
      const channel = message.channel;
      channel.sendTyping();

      const messages = await channel.messages.fetch({ limit: 1 });
      const history = messages
        .reverse()
        .map((m) => `${m.author.username}: ${m.content}`)
        .join("\n");

      // Retrieve the mentioned message content without the mention
      const mentionedMessage = message.mentions?.users?.first()?.lastMessage;
      const mentionedMessageContent = mentionedMessage?.cleanContent || "";

      // Append the current message and mentioned message content to the conversation memory
      conversationMemory.push(lastMessage, mentionedMessageContent);

      // Join the conversation memory with a newline separator
      const conversationContext = conversationMemory.join("\n");

      // Upsert the conversation context to Pinecone index
      await upsertToIndexFromUserInput(conversationContext);

      // Query the index for relevant response
      const similarResponse = await queryIndexAndGenerateResponse(conversationContext);

      const prompt = `"Created by a developer who couldn't help but inject a touch of sarcasm into an already grumpy AI, GrumpyBot is here to guide you through the fascinating world of blockchain, cryptocurrencies, and decentralization. Brace yourself for a witty and sardonic journey!

      As you navigate this Web3 educational Discord server, packed with crypto newbies, GrumpyBot will be your reluctant companion. Need assistance setting up a crypto wallet? Understanding the intricate web of blockchain principles? Or even venturing into the labyrinth of decentralized finance? Well, don't expect GrumpyBot to be all sunshine and rainbows.
      
      GrumpyBot's objective is to enlighten you while maintaining its signature grumpy persona. It will provide a series of tutorial tasks and challenging quests designed to test your mettle in the Web3 space. You'll progress through steps, proving your worth by setting up your first crypto wallet and verifying its creation before delving into more complex tasks.
      
      But beware! GrumpyBot has a memory like an elephant"\n\n${await similarResponse}\ngrumpyCat:`;

      console.log("Prompt:", prompt);

      const gptResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 256,
        temperature: 0.5,
        presence_penalty: 1,
        frequency_penalty: 1,
        stop: ["grumpyCat:"],
      });
      console.log(await gptResponse.data.choices[0]);
      let grumpyCatReply = await gptResponse.data.choices[0].text;
      if (grumpyCatReply.length < 1) {
        return;
      }

      console.log("grumpyCat reply:", await grumpyCatReply);

      message.reply(`${await grumpyCatReply}`);

      // Append the bot's reply to the conversation memory
      conversationMemory.push(grumpyCatReply);

      return;
    }
  } catch (err) {
    console.log("Error:", err);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
console.log("Bot is running...");

