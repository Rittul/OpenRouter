const prisma = require("../src/config/prisma");

async function main() {

  await prisma.modelProviderMapping.deleteMany();
  await prisma.model.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.company.deleteMany();

  // companies
  const openai = await prisma.company.create({
    data: {
      name: "OpenAI",
      website: "https://openai.com"
    }
  });

  const anthropic = await prisma.company.create({
    data: {
      name: "Anthropic"
    }
  });

  const google = await prisma.company.create({
    data: {
      name: "Google",
      website: "https://google.com"
    }
  });

  // providers
  const openrouter = await prisma.provider.create({
    data: {
      name: "OpenRouter"
    }
  });

  // models
  const gpt4 = await prisma.model.create({
    data: {
      name: "GPT-4",
      slug: "gpt-4",
      company_id: openai.id
    }
  });

  const geminiFlash = await prisma.model.create({
    data: {
      name: "Gemini 2.5 Flash",
      slug: "gemini-2.5-flash",
      company_id: google.id
    }
  });

  // mappings
  await prisma.modelProviderMapping.create({
    data: {
      model_id: gpt4.id,
      provider_id: openrouter.id,
      input_token_cost: 0.01,
      output_token_cost: 0.03
    }
  });

  await prisma.modelProviderMapping.create({
    data: {
      model_id: geminiFlash.id,
      provider_id: openrouter.id,
      input_token_cost: 0.00035,
      output_token_cost: 0.00105
    }
  });

}

main();