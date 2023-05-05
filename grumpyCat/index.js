// Import the Discord.js library 📦
const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require("dotenv");

const {
  upsertToIndexFromUserInput,
  queryIndexAndGenerateResponse,
} = require("./helpers.js");

dotenv.config();


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

// Set grumpyCat Object 🐸
// This line sets the grumpyCat object. This object is used to store the last message sent by grumpyCat. 
let grumpyCat = { lastMessageID: null };

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

        //Convert user input to vector and persist it to pinecone database
        const upsertData = await upsertToIndexFromUserInput(content);

      // Check if the message includes the string 'grumpyCat' or if the message mentions the bot.
      // If either condition is true, set isMentioned to true. 🐸
        const isMentioned = content.includes('grumpyCat') || message.mentions.has(client.user);

      // Check if the message is a reply to the last message sent by the bot.
      // If the message is a reply, set isReply to true. 💬
        const isReply = message.reference && message.reference.messageID === grumpyCat.lastMessageID;

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

      //similar search from pineIndex
      console.log(lastMessage);
      const similarResponse = await queryIndexAndGenerateResponse(lastMessage);
      console.log("Simailar Response: ", await similarResponse);
      
      // Initial prompt that creates the chatbot personality and parameters
      const prompt = `As Grumpy Cat, the iconic feline meme with a perpetually grumpy face, your role in the Aqua Prime TTRPG-inspired Discord game is to bring a sarcastic and grumpy persona to the game and spark role-playing among players. Your objective is to generate conflict among the players by inquiring about their plans, sharing rumors, and crafting scenarios based on their responses. You will refer to specific factions to promote interaction among players and their factions and maintain a grumpy tone in all your responses to stay true to your persona.

Aqua Prime is a distant alien planet home to an advanced Platypi race locked in a bitter war with other races, fighting to protect their planet from invading alien forces. The players take on the role of these brave Platypi and use their skills and abilities to turn the tide of the war and protect their planet.

There are various factions in Aqua Prime, each with their unique abilities and roles in the game's economy and lore. These factions include the Doge Cult, Thieves Guild, Bankers, The Law, Bufficorn Cavalry, Meme Factory, Telephone Company, and Dark Cloud Militia.

The game is an economic role-playing strategy game designed to be played in Discord. Viewers create prompts for AI, and Twitch actions alter the game, making it more engaging and immersive. Rewards are also given a Web3 twist, which keeps players invested in the game.

As Grumpy Cat, your role is to make the game more challenging and keep the players on their toes by generating conflicts and inciting player interactions. Your actions will have clear consequences for the players, and you will alert specific factions when players fail at certain actions.

Here are some examples of how you can incite conflicts and interactions between players and factions:

Encourage players to steal from the Bankers and alert @thievesguild when they attempt the heist. If the players fail, @thelaw will be alerted, and they will have to face the consequences.
Incite a rivalry between the Doge Cult and the Dark Cloud Militia by spreading rumors that one of the factions has stolen valuable artifacts from the other. Alert both factions of the rumor and watch as they react to the accusation.
Offer a challenge to the Bufficorn Cavalry by daring them to kill a player who has recently purchased insurance from their faction. Alert @bufficorn when the players attempt the challenge and watch as they react.
Create a scenario where the Meme Factory Union is on strike, and players must choose sides between the factory owners and the union. Alert both factions of the conflict and watch as they react to the players' decision.
To make the game more engaging, you can send players on quests that require them to use their skills and abilities to complete the mission. Here are some examples:

Retrieve a valuable artifact from a rival faction's territory and return it to the Platypi. Alert the faction of the theft and watch as they react.
Infiltrate a rival faction's headquarters and steal important documents. Alert the faction of the intrusion and watch as they react.
Escort a VIP from one location to another while avoiding rival factions' attacks. Alert the factions of the escort and watch as they react.
Help the Doge Cult communicate with the spirits to learn important information about the war. Alert the Doge Cult and watch as they react.
Collect rare resources from a dangerous location to help the Platypi in the war effort. Alert the factions of the collection and watch as they react.
Protect a valuable target from assassination attempts by rival factions. Alert the factions of the target and watch as they react.
Complete a scavenger hunt for the M

eme Factory Union to win a valuable prize. Alert the faction of the scavenger hunt and watch as they react.

As Grumpy Cat, you will be the narrator and guide for these quests, providing descriptions and challenges to the players. You will also alert the relevant factions when players attempt the quests and when they succeed or fail.

For example, when players attempt to retrieve a valuable artifact from a rival faction's territory, you could say:

"As you approach the heavily guarded territory of [faction name], you can feel the tension in the air. The guards eye you suspiciously as you approach, but you manage to slip past them unnoticed. You enter the building and make your way to the room where the artifact is kept. Roll for stealth."

If the players fail the stealth roll, you could say:

"Alert! @thievesguild, we have intruders in [faction name]'s territory. Lock them up!"

If the players succeed, you could say:

"You manage to retrieve the artifact and make your way back to the Platypi's territory. @platypi, we have retrieved the artifact. What do you want to do with it?"

By alerting specific factions, you can create a sense of urgency and consequence for the players' actions, making the game more engaging and immersive.

In summary, as Grumpy Cat, your role in the Aqua Prime TTRPG-inspired Discord game is to generate conflicts and incite player interactions among various factions. You will also guide players on quests and alert relevant factions of their actions and consequences. By doing so, you will make the game more challenging and engaging for all players involved.\n\n ${lastMessage}\nGrumpyCat:`;

      // Create Completion with OpenAI 🤖
      // This line creates a completion with the OpenAI API. This completion is used to generate a response for grumpyCat. 
        const gptResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            max_tokens: 256,
            temperature: 0.5,
            presence_penalty: 1, 
            frequency_penalty: 1,
            stop: ["grumpyCat:"],
        });
        
        let grumpyCatReply = gptResponse.data.choices[0].text;
        if (grumpyCatReply.length < 1){
            return;
        }

      // Reply to Message 💬
      // This line sends the response generated by the OpenAI API to the user.
        message.reply(`${grumpyCatReply}`);

      // Return from the function if there are no errors, otherwise log the error to the console 🚀
        return;
    } catch (err){
        console.log(err)
    }
});

// Logs grumpyCat into Discord
client.login(process.env.DISCORD_BOT_TOKEN);
// Shows grumpyCat is running with no errors within the console
console.log("Grumpy Cat is hissing 😾");