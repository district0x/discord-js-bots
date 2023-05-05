// Load dependencies
const dotenv = require("dotenv");
const PineconeClient = require("@pinecone-database/pinecone").PineconeClient;
const { Configuration, OpenAIApi } = require("openai");

// Load environment variables
dotenv.config();

// Create Pinecone and OpenAI instances
const pinecone = new PineconeClient();
const configuration = new Configuration({
	organization: process.env.OPENAI_ORG,
	apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

// Initialize Pinecone index
let index;
const pineconeIndexName = process.env.PINECONE_INDEX_NAME;

const initializePinecone = async () => {
	try {
		// Initialize Pinecone with environment and API key from environment variables
		const pineconeRes = await pinecone.init({
			environment: process.env.PINECONE_ENVIRONMENT,
			apiKey: process.env.PINECONE_KEY,
		});
		console.log("Pinecone initialized successfully!");

		// Get list of indexes in Pinecone
		const indexList = await pinecone.listIndexes();
		console.log("Index list retrieved successfully!");

		// Check if the index exists and retrieve it if it does
		if (indexList.includes(pineconeIndexName)) {
			console.log(pineconeIndexName + " is present in the array");
			index = pinecone.Index(pineconeIndexName);
		} else {
			// Create new index if it doesn't exist
			index = await pinecone.createIndex({
				createRequest: {
					name: pineconeIndexName,
					dimension: 1536,
				},
			});
			console.log("Index created successfully!");
		}

		console.log("Pinecone initialization completed successfully!");
	} catch (error) {
		console.error("Pinecone initialization failed: ", error);
	}
};

const generateEmbeddings = async (userInput) => {
	try {
		// Initialize the OpenAI API with the appropriate configuration
		const openai = new OpenAIApi(configuration);
		// Use the createEmbedding method to generate embeddings for the input using the text-embedding-ada-002 model
		const response = await openai.createEmbedding({
			model: "text-embedding-ada-002",
			input: userInput,
		});

		// If the response contains embeddings, return the embeddings as an array
		if (
			response &&
			response.data &&
			response.data.data &&
			response.data.data.length > 0 &&
			response.data.data[0].embedding
		) {
			responseData = response.data.data[0].embedding;
			return responseData;
		} else {
			console.log("Error: Embedding not found in response");
		}
	} catch (error) {
		console.error("Error in generateEmbeddings:", error);
	}
};

//upsert Data
const upsertToIndex = async (generatedEmbeddings, userInput) => {
	// Construct an upsert request object with the embeddings, input string, and Pinecone index name
	const upsertRequest = {
		vectors: [
			{
				id: new Date().getTime().toString(),
				values: generatedEmbeddings,
				metadata: { input: userInput },
			},
		],
		namspace: pineconeIndexName,
	};

	try {
		// Use the upsert method from the Pinecone API to upsert the embeddings to the index
		const upsertResponse = await index.upsert({ upsertRequest });
		// console.log(await upsertResponse);
		return upsertResponse;
	} catch (error) {
		console.error(`Error upserting to index: ${error.message}`);
	}
};

// Query index
const searchIndex = async (query) => {
	try {
		// Generate embeddings for the query
		const embedding = await generateEmbeddings(query);

		// Construct a query request object with the embeddings, topK value, and Pinecone index name
		const queryRequest = {
			vector: embedding,
			topK: 5,
			includeValues: true,
			includeMetadata: true,
		};

		// Use the query method from the Pinecone API to query the index for the top matches
		const queryResponse = await index.query({ queryRequest });
		const textArray = await queryResponse.matches.map(
			(result) => result.metadata.input
		);
		return textArray;
	} catch (error) {
		console.error("An error occurred while searching the index:", error);
		throw error;
	}
};

//Get index status and description
const indexDescription = async () => {
	const indexStatus = await pinecone.describeIndex({
		indexName: pineconeIndexName,
	});
	return indexStatus;
};

const upsertToIndexFromUserInput = async (userInput) => {
	try {
		const initializedPinecone = await initializePinecone();
		const generatedEmbeddings = await generateEmbeddings(userInput);
		const upsertedToIndex = await upsertToIndex(
			generatedEmbeddings,
			userInput
		);
		console.log("Upsert complete", await upsertToIndex);
	} catch (error) {
		console.error("An error occurred while upserting to index:", error);
		throw error;
	}
};

const queryIndexAndGenerateResponse = async (query) => {
	try {
		const initializedPinecone = await initializePinecone();
		const queryRes = await searchIndex(query);
		console.log("Search results", await queryRes[0]);
		return queryRes[0];
	} catch (error) {
		console.error(
			"An error occurred while querying index and generating response:",
			error
		);
		throw error;
	}
};

//exporting modules
module.exports = {
	upsertToIndexFromUserInput,
	queryIndexAndGenerateResponse,
};
