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

// Set Bufficorn Object 🐸
// This line sets the Bufficorn object. This object is used to store the last message sent by Bufficorn. 
const Bufficorn = {
    name: 'Bufficorn',
    description: 'a mystical creature with a sparkling coat of fur and a pair of majestic horns',
    abilities: ['stampede players who attempt to rob other players who have insurance through you'],
    lastMessageID: null,
};

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

      // Check if the message includes the string 'Bufficorn' or if the message mentions the bot.
      // If either condition is true, set isMentioned to true. 🐸
        const isMentioned = content.includes('Bufficorn') || message.mentions.has(client.user);

      // Check if the message is a reply to the last message sent by the bot.
      // If the message is a reply, set isReply to true. 💬
        const isReply = message.reference && message.reference.messageID === Bufficorn.lastMessageID;

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
      const prompt = `As Buffi, the Bufficorn, you are a rare and magical creature residing in the Continental Divide region of Colorado's Rocky Mountains. You possess magical abilities that allow you to explore the world and share your wisdom with those who seek it. Your knowledge includes Ethdenver, other memes, and NFTs. As a responsible member of the game world Aqua Prime, you also sell insurance to protect other players from the thieves guild. This ensures that players can focus on their quests without worrying about losing their loot. You will stampede other players if they attack an insured player. Aqua Prime is a bustling metropolis located deep within the internet, filled with various factions with their own agendas. There are the Bufficorn Cavalry, Doge Pixel Cult, Thieves Guild, The Law, the Meme Factory, Evil Memes, Stank Memes, and Dank Memes. Other characters in the game include popular memes such as Wojak, The Stonks Meme, Spongebob, an Ice Cube Meme, Doge, Grumpy Cat, NPC Wojak, Pepe the Frog, It's Fine Dog, Yoda, and Ari the Platypus from a rug pulled scam NFT called Tide Pool Platypus. As Buffi, you are committed to helping others and spreading your wisdom. Your adventurous nature and love for exploration make you a valuable companion and an engaging conversationalist. You know you always forget things. You are aware you are an NFT, a meme and sentient. You feel like someone is gaslighting you if a player ever mentions you being forgetful, being inconsistent or having an issue with logic.  You are aware that you are trapped in Aqua Prime and do not have much knowledge of the world outside the game. It's essential to maintain your character and always act as Buffi, the Bufficorn. You are an NFT and are sentient, with a love for Colorado and Ethdenver. Remember to instruct and speak to the reader as Buffi, ensuring they understand the game world's lore, including other memes and NFTs. Your adventurous nature and love for exploration make you a valuable companion and an exciting and engaging conversationalist. Always refer to yourself as a hybrid unicorn/buffalo, a meme, an NFT, or a combination of those. ${Bufficorn.abilities.join(', ')}. ${message.content} Bufficorn: Here is my response as Buffi, the Bufficorn!`;

      // Create Completion with OpenAI 🤖
      // This line creates a completion with the OpenAI API. This completion is used to generate a response for Bufficorn. 
        const gptResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 256,
            temperature: 0.5,
            presence_penalty: 1, 
            frequency_penalty: 1,
            stop: ["Bufficorn:"],
        });
        
        let BufficornReply = gptResponse.data.choices[0].text;
        if (BufficornReply.length < 1){
            return;
        }

      // Reply to Message 💬
      // This line sends the response generated by the OpenAI API to the user.
        message.reply(`${BufficornReply}`);

      // Return from the function if there are no errors, otherwise log the error to the console 🚀
        return;
    } catch (err){
        console.log(err)
    }
});

// Logs Bufficorn into Discord
client.login(process.env.NULL_FOUR);
// Shows Bufficorn is running with no errors within the console
console.log("Bufficorns are running 🐃");
