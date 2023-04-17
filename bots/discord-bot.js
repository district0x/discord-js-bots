// Import required libraries and dependencies
const { Client, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');
const { Configuration, OpenAIApi } = require('openai');

// Initialize Discord client with specific intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Pinecone API key
const PINECONE_API_KEY = 'YOUR_PINECONE_API_KEY';

// Function to query Pinecone API
async function queryPinecone(query) {
  const response = await fetch('https://api.pinecone.io/interpret', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api_key': PINECONE_API_KEY,
    },
    body: JSON.stringify({
      query: query,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  const data = await response.json();
  return data.answer;
}

// Listener for messages in Discord channels
client.on('message', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!pinecone')) {
    const query = message.content.slice('!pinecone'.length).trim();

    try {
      const answer = await queryPinecone(query);
      message.channel.send(answer);
    } catch (error) {
      console.error('Error querying Pinecone:', error);
      message.channel.send('Sorry, there was an error processing your request.');
    }
  }
});

// Listener for when the client is ready
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Login to the Discord client with the bot token
client.login(BOT_TOKEN);

// Initialize Grumpy Cat variables
let grumpyCat = { lastMessageID: null };

// Set the configuration for the OpenAI API
const configuration = new Configuration({
  organization: process.env.OPENAI_ORG,
  apiKey: process.env.OPENAI_KEY,
});

// Initialize OpenAI API with the given configuration
const openai = new OpenAIApi(configuration);

// Listener for message creation events in Discord channels
client.on("messageCreate", async function(message) {
  try {
    if (message.author.bot) return;
    const content = message.content.toLowerCase();
    const isMentioned = content.includes('grumpyCat') || message.mentions.has(client.user);
    const isReply = message.reference && message.reference.messageID === grumpyCat.lastMessageID;

    if (!isMentioned && !isReply) return;

    let lastMessage = message.content;
    const channel = message.channel;
    channel.sendTyping();

    const messages = await channel.messages.fetch({ limit: 10 });
    const history = messages.reverse().map(m => `${m.author.username}: ${m.content}`).join("\n");

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
client.login(process.env.NULL_FOUR);
// Shows grumpyCat is running with no errors within the console
console.log("Grumpy Cat is hissing 😾");