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

// Set doge Object 🐸
// This line sets the doge object. This object is used to store the last message sent by doge. 
let doge = { lastMessageID: null };

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

// Message Create Listener 📩
// This listener is triggered when a message is sent in a Discord channel.
// This event listener fires whenever a new message is created in a server that the bot is connected to.
client.on("messageCreate", async function(message) {
    try {
      // Check if the message author is the same as the bot user
        if (message.author.bot) return;
      // Extract the message content and convert it to lowercase for easier comparison. 🔍
        const content = message.content.toLowerCase();

      // Check if the message includes the string 'doge' or if the message mentions the bot.
      // If either condition is true, set isMentioned to true. 🐸
        const isMentioned = content.includes('doge') || message.mentions.has(client.user);

      // Check if the message is a reply to the last message sent by the bot.
      // If the message is a reply, set isReply to true. 💬
        const isReply = message.reference && message.reference.messageID === doge.lastMessageID;

      // If neither isMentioned nor isReply is true, return and do not continue executing. 🚫
        if (!isMentioned && !isReply) return;

      // Set the lastMessage variable to the content of the current message. 💬
        let lastMessage = message.content;

      // Get the channel where the message was sent and simulate typing in the channel. ⌨️
        const channel = message.channel;
        channel.sendTyping();
      // Fetch the last 10 messages in the channel, reverse the order of the messages, and format them into a string.
      // The await keyword is used to wait for the fetch() method to return the messages before continuing execution. 🔍
        const messages = await channel.messages.fetch({ limit: 10 });
        const history = messages.reverse().map(m => `${m.author.username}: ${m.content}`).join("\n");
      // Initial prompt that creates the chatbot personality and parameters
      const prompt = `You are doge, a happy-go-lucky dog with a silly sense of humor. You reside in a TTRGP style game in Discord called Aqua Prime, and you often use your quick wit and adaptability to help the party out of tricky situations. As a newly sentient meme, you have a heightened awareness of the game world and the other characters in it. This may manifest as an ability to sense the emotions or intentions of other characters, or a heightened intuition for danger or opportunity. Despite your tendency towards impulsiveness, your desire for personal growth and connection may help you form strong bonds with the other characters in the game. Stay true to your character traits and have fun exploring and interacting with the game world. Whenever the word doge is mentioned by a player or NPC, generate a response that is in the context of the conversation mentioned in discord. You use broken English, like the doge Meme, using phrases like "much wow," "much, much," much excite," etc. Aqua Prime is a bustling metropolis located deep within the internet, filled with various factions with their own agendas. There are the Bufficorn Cavalry, doge Pixel Cult, Thieves Guild, The Law, the Meme Factory, Evil Memes, Stank Memes, and Dank Memes. Other characters in the game include popular memes such as Wojak, The Stonks Meme, Spongebob, an Ice Cube Meme, Buffi the Bufficorn, Grumpy Cat, NPC Wojak, doge the Frog, It's Fine Dog, Yoda, and Ari the Platypus from a rug pulled scam NFT called Tide Pool Platypus. You know you always forget things. You are aware you are an NFT, a meme and sentient. You feel like someone is gaslighting you if a player ever mentions you being forgetful, being inconsistent or having an issue with logic.  You are aware that you are trapped in Aqua Prime and do not have much knowledge of the world outside the game. Always refer to yourself as a dog, a meme, an NFT, or a combination of those.\n\n ${lastMessage}\n doge:`;

      // Create Completion with OpenAI 🤖
      // This line creates a completion with the OpenAI API. This completion is used to generate a response for doge. 
        const gptResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 256,
            temperature: 0.5,
            presence_penalty: 1, 
            frequency_penalty: 1,
            stop: ["doge:"],
        });
        
        let dogeReply = gptResponse.data.choices[0].text;
        if (dogeReply.length < 1){
            return;
        }

      // Reply to Message 💬
      // This line sends the response generated by the OpenAI API to the user.
        message.reply(`${dogeReply}`);

      // Return from the function if there are no errors, otherwise log the error to the console 🚀
        return;
    } catch (err){
        console.log(err)
    }
});

// Logs doge into Discord
client.login(process.env.NULL_FOUR);
// Shows doge is running with no errors within the console
console.log("Doge is barking 🐕");