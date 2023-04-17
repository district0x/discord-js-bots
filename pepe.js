//Import the Sentiment.js library
const Sentiment = require('sentiment');
//Create an instance of the Sentiment.js library
const sentiment = new Sentiment();

// Import the Discord.js library 📦
const { Client, GatewayIntentBits } = require('discord.js');

// Create a new Discord client instance 🤖
const client = new Client({
  // Configure the client to subscribe to specific events from the Discord API 🛡️
  intents: [
    // Subscribe to the Guilds intent to receive information about user's guilds 🏰
    GatewayIntentBits.Guilds,
    // Subscribe to the GuildMessages intent to receive messages sent in guild channels 💬
    GatewayIntentBits.GuildMessages,
    // Subscribe to the MessageContent intent to receive the contents of messages sent in guild channels 📝
    GatewayIntentBits.MessageContent
  ]
});

//👆 This is a comment. Comments are used to add notes to your code that are not executed as part of the program. 📝📚

// Initialize a new Discord bot that can connect to Discord servers and receive information about the user's guilds, messages, and message content 🤖🛡️🏰💬📝. 

// Set Pepe Object 🐸
// This line sets the Pepe object. This object is used to store the last message sent by Pepe. 
let pepe = { lastMessageID: null };

// Array that stores the previous 3 messages to mitigate AI Drift
let conversationHistory = [];

// Import the OpenAI library and dependencies 🔑📦
const { Configuration, OpenAIApi } = require('openai');

// Set the configuration for the OpenAI API, including organization name and API key 🔑🔍
const configuration = new Configuration({
  // Set the organization name using the OPENAI_ORG environment variable 🔍🏭
  organization: process.env.OPENAI_ORG,
  // Set the API key using the OPENAI_KEY environment variable 🔍🔑
  apiKey: process.env.OPENAI_KEY,
});

// Initialize OpenAI API 💻
// This line allows the application to access the OpenAI API with the given configuration. 
const openai = new OpenAIApi(configuration);
//  Logs a message to the console once the bot is ready to start interacting with Discord
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// create a dictionary to store messages for each player using their Discord ID
const userMessages = {};

// Initialize an empty object to store the sentiment levels of each user
const userSentimentLevels = {};

// Message Create Listener 📩
// This listener is triggered when a message is sent in a Discord channel.
// This event listener fires whenever a new message is created in a server that the bot is connected to.
client.on("messageCreate", async function(message) {
  try {
    // Check if the message author is the same as the bot user
    if (message.author.bot) return;
    // Extract the message content and convert it to lowercase for easier comparison. 🔍
    const content = message.content.toLowerCase();

    // Check if the message includes the string 'pepe' or if the message mentions the bot.
    // If either condition is true, set isMentioned to true. 🐸
    const isMentioned = content.includes('pepe') || message.mentions.has(client.user);

    // Check if the message is a reply to the last message sent by the bot.
    // If the message is a reply, set isReply to true. 💬
    const isReply = message.reference && message.reference.messageID === pepe.lastMessageID;

    // If neither isMentioned nor isReply is true, return and do not continue executing. 🚫
    if (!isMentioned && !isReply) return;

    // Set the lastMessage variable to the content of the current message. 💬
    let lastMessage = message.content;

    // Analyze the sentiment of the message
    const result = sentiment.analyze(lastMessage);

    // Determine the sentiment of the message
    let sentimentType;
    let sentimentLevel = 0
    if (result.score > 0) {
      sentimentLevel = sentimentLevel - 1
      sentimentType = "positive";
    } else if (result.score < 0) {
      sentimentLevel = sentimentLevel + 1
      sentimentType = "negative";
    } else {
      sentimentType = "neutral";
    }



    // Log the sentiment type of the message
    console.log(`Sentiment of message: ${sentimentType}`);

    // Get the user ID
    const userId = message.author.id;

    // Create a property for the user in the userSentimentLevels object if it doesn't exist
    if (!userSentimentLevels[userId]) {
      userSentimentLevels[userId] = 0;
    }

    // Create an empty array to store the user's message history if it doesn't exist
    if (!userMessages[userId]) {
      userMessages[userId] = [];
    }

    // Update the sentiment level of the user
    if (result.score > 0) {
      userSentimentLevels[userId] -= 1;
    } else if (result.score < 0) {
      userSentimentLevels[userId] += 2;
    }

    // Log the current sentiment level of the user
    console.log(`Current sentiment level of user ${message.author.username}: ${userSentimentLevels[userId]}`);
    // Add the message to the user's message history
    userMessages[userId].push(`Player ${userId}: ${message.content}`);

    // Only keep the last 5 messages in the message history array
    userMessages[userId] = userMessages[userId].slice(-5);

    // Log the user's message history
    console.log(`User ${message.author.username} message history: `, userMessages[userId]);


    // Get the channel where the message was sent and simulate typing in the channel. ⌨️
    const channel = message.channel;
    channel.sendTyping();


    // Initial prompt that creates the chatbot personality and restraints of the bot
    // Currently using a compression method to experiment with shrinking the prompt
    const prompt =
      `🅒-t:🎮AquaPrime🌐TTRPG-MMORPG,💻📱🕸️3,🃏📊🤣; 🅘:🦸‍♂️👾🪐,📺💬🔗,🏆🎯; 🅜:💸🎫🛍️,🔧⚔️,🛡️🎨,💼🏪,🌐🏬; 🅝:🔫💣📉,💰💎🎁,🎭👕🥿; 🅔:Web3🎓🔗,NFT🏆,💡🧪; 🅣:⚙️🤝🧩,🔮🌍🔁.\n\n 
    
    Player Info:
    How mad you are at a player, on a scale of 1 to 10, 1 being not angry at all, 10 being very angry: ${userSentimentLevels[userId]} \n
    Players Name: ${message.author.username} \n\n
    


    ${userMessages[userId]} \n\n Pepe:`;

    // Create Completion with OpenAI 🤖
    // This line creates a completion with the OpenAI API. This completion is used to generate a response for Pepe. 
    const gptResponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 256,
      temperature: 0.3,
      presence_penalty: 1,
      frequency_penalty: 1,
      stop: ["pepe:"],
    });

    let pepeReply = gptResponse.data.choices[0].text;
    if (pepeReply.length < 1) {
      return;
    }

// Reply to Message 💬
// This line sends the response generated by the OpenAI API to the user.
message.reply(`${pepeReply}`);
userMessages[userId].push(`Pepe: ${pepeReply}`)
// Get the roles of the user who sent the message
const memberRoles = message.member.roles;
// Get the guild where the message was sent
const guild = message.guild;

if (userSentimentLevels[userId] >= 3) {
  message.reply(`Nevermind. I lost my patience. Pepe shot and killed ${message.author.toString()} 
  💥🔫`)
   if (!memberRoles.cache.has('1075838775307030598')) {
  
    await message.member.roles.add('1075838775307030598');
  }
  
  if (memberRoles.cache.has('1059989387875729438')) {
    await message.member.roles.remove('1059989387875729438');
  };
}


// Return from the function if there are no errors, otherwise log the error to the console 🚀
return;

  } catch (err) {
    console.log(err)
  }
});

// Logs Pepe into Discord
client.login(process.env.NULL_FOUR);
// Shows Pepe is running with no errors within the console
console.log("Pepe is Green 🐸");
