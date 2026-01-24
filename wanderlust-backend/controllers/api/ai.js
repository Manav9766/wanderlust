const OpenAI = require("openai");
const ExpressError = require("../../utils/ExpressError");
const Listing = require("../../models/listing");
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports.generateDescription = async (req, res) => {
  const { title, location, country, category, price } = req.body;

  if (!title || !location || !country) {
    throw new ExpressError(400, "Missing required listing details");
  }

  const prompt = `
Write a short, attractive Airbnb-style listing description.

Title: ${title}
Location: ${location}, ${country}
Category: ${category || "Property"}
Price per night: ${price || "N/A"}

Keep it friendly, professional, and under 120 words.
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 150,
  });

  const text = response.choices[0]?.message?.content;

  if (!text) {
    throw new ExpressError(500, "AI failed to generate description");
  }

  res.json({ description: text });
};

module.exports.summarizeReviews = async (req, res) => {
  const { listingId } = req.body;

  if (!listingId) {
    throw new ExpressError(400, "Listing ID is required");
  }

  const listing = await Listing.findById(listingId).populate("reviews");

  if (!listing || !listing.reviews || listing.reviews.length === 0) {
    throw new ExpressError(400, "No reviews available to summarize");
  }

  const reviewsText = listing.reviews
    .map((r, i) => `Review ${i + 1}: ${r.comment}`)
    .join("\n");

  const prompt = `
Summarize the following Airbnb guest reviews.
Be concise, balanced, and helpful for future guests.
Limit to 3–4 sentences.

${reviewsText}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    max_tokens: 120,
  });

  const summary = response.choices[0]?.message?.content;

  if (!summary) {
    throw new ExpressError(500, "AI failed to summarize reviews");
  }

  res.json({ summary });
};