// 📦 Import the node-fetch library to make HTTP requests
const fetch = require('node-fetch');

// 🔍 Define an async function named main
async function main() {
  // 🌐 Use fetch to get the public IP address of this machine
  const ip = await fetch('https://api.ipify.org').then(response => response.text());
  // 🖨️ Print the public IP address to the console
  console.log(ip);

  // 🤖 Import the `discord.js` library to interact with the Discord API
  const { Client, GatewayIntentBits, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')


  // 🦍 Imports a character module file (Example: pepe.js) but you can add others as you can see in the commented out files below. Simply uncomment them by removing // so they wil be initiated as well.
  
//👇 - USE THIS FOR TESTING - 👇
   //const pepe1 = require('./pepe/pepe1.4');
 //  | 👆😎👉For pepe | Discord API Key: NULL_TWO 2️⃣
  //const home = require('./pilz/home');
//👆 - USE THIS FOR TESTING - 👆
  
  const wojak = require('./wojak/genericChatGPt');
  // | 👆😎👉 Extra Key for testing currently used in the above file
  
  //const dankjak = require('./archive/dankjack'); 
  // | 👆😎👉 Extra Key for testing currently used in the above file
  
  //const grumpycat = require('./grumpycat/grumpycat.js');
  // | 👆😎👉 Extra Key for testing currently used in the above file
  
  // 🤖 Create a new Discord client instance
  const discordClient = new Client({
    // 🔒 Define the intents required by the bot
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });
}

// 🔥 Call the main function to start the program
main();
