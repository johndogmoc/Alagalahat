export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  tags: string[];
  content: string;
}

export const articles: Article[] = [
  {
    id: "1",
    slug: "vaccination-schedule-dogs",
    title: "Complete Vaccination Schedule for Dogs in the Philippines",
    category: "health",
    excerpt: "A comprehensive guide to keeping your dog protected from common diseases like parvovirus, distemper, and rabies.",
    readTime: "8 min read",
    tags: ["Vaccination", "Dogs", "Prevention"],
    content: `
      <h2>The Importance of Vaccination</h2>
      <p>Vaccinating your dog is the most effective way to prevent severe, often fatal diseases. In the Philippines, the hot and humid climate can sometimes accelerate the spread of certain viruses, making timely vaccination crucial.</p>
      
      <h2>Core Vaccines</h2>
      <p>The standard core vaccine for dogs is the <strong>DHPP</strong> or 5-in-1 vaccine, which protects against:</p>
      <ul>
        <li><strong>Canine Distemper:</strong> A highly contagious and airborne virus.</li>
        <li><strong>Hepatitis:</strong> An infectious viral disease that affects the liver.</li>
        <li><strong>Parvovirus:</strong> A highly contagious virus that attacks the gastrointestinal tract, especially in puppies.</li>
        <li><strong>Parainfluenza:</strong> A respiratory virus that is one of the causes of kennel cough.</li>
      </ul>
      <p><strong>Rabies</strong> is also a core, legally required vaccine due to the high incidence of rabies in the country.</p>
      
      <h2>Recommended Schedule</h2>
      <p>Puppies should start their first DHPP shots between 6-8 weeks of age, with boosters every 3-4 weeks until they are 16 weeks old. The first Rabies shot should be given around 14-16 weeks. Afterwards, annual boosters are legally and medically necessary.</p>
    `
  },
  {
    id: "2",
    slug: "cat-nutrition-basics",
    title: "Essential Nutrition Guide for Filipino Cat Owners",
    category: "nutrition",
    excerpt: "What to feed your cat, how much, and why proper nutrition prevents 80% of common health issues.",
    readTime: "6 min read",
    tags: ["Cats", "Diet", "Health"],
    content: `
      <h2>Understanding Feline Nutrition</h2>
      <p>Cats are obligate carnivores, meaning their bodies require nutrients strictly found in animal flesh. Unlike dogs, cats cannot thrive on a plant-based or omnivore diet. A cat's diet needs high protein, moderate fat, and very low carbohydrates.</p>
      
      <h2>Hydration is Key</h2>
      <p>In the Philippine heat, hydration is especially critical. Wet food (canned or pouches) is highly recommended over dry kibble because it provides a significant amount of moisture. If you feed strictly kibble, your cat is at higher risk for Feline Lower Urinary Tract Disease (FLUTD).</p>

      <h2>Foods to Avoid</h2>
      <ul>
        <li><strong>Onions and Garlic:</strong> Causes red blood cell damage.</li>
        <li><strong>Chocolate:</strong> Contains theobromine, which is highly toxic.</li>
        <li><strong>Milk:</strong> Most adult cats are lactose intolerant.</li>
        <li><strong>Raw fish:</strong> Thiaminase in raw fish breaks down an essential B vitamin, leading to severe neurological issues.</li>
      </ul>
    `
  },
  {
    id: "3",
    slug: "heatstroke-first-aid",
    title: "First Aid: How to Handle Pet Heatstroke",
    category: "first_aid",
    excerpt: "Emergency steps when your pet is overheating — especially important during Philippine summers.",
    readTime: "4 min read",
    tags: ["Emergency", "First Aid", "Summer"],
    content: `
      <h2>Recognizing Heatstroke</h2>
      <p>In the intense summer heat of the Philippines, heatstroke can happen in minutes. Signs include excessive panting, drooling, red gums, vomiting, uncoordinated movement, and collapse. Flat-faced breeds (like Pugs or Persian cats) are at a much higher risk.</p>

      <h2>Immediate Actions</h2>
      <ol>
        <li><strong>Move them to a cool place:</strong> Get them under a fan, air conditioning, or at least out of direct sunlight immediately.</li>
        <li><strong>Apply COOL water:</strong> Gently wet their body with cool (not freezing cold or ice) water. Focus on areas with less fur, like their belly and paws. Ice water can cause blood vessels to constrict, trapping heat inside.</li>
        <li><strong>Offer water:</strong> Offer small amounts of room temperature water to drink, but do not force it down their throat.</li>
        <li><strong>Rush to the Vet:</strong> Heatstroke can cause internal organ failure even after the pet seems to have cooled down. They need professional medical monitoring.</li>
      </ol>
    `
  },
  {
    id: "4",
    slug: "dog-behavior-basics",
    title: "Understanding Your Dog's Body Language",
    category: "behavior",
    excerpt: "Learn to read what your dog is telling you through tail wagging, ear positions, and vocalizations.",
    readTime: "7 min read",
    tags: ["Dogs", "Behavior", "Communication"],
    content: `
      <h2>More Than Just a Bark</h2>
      <p>Dogs communicate primarily through their body. By paying attention to their ears, tail, and posture, you can understand their emotional state and prevent potential conflicts.</p>
      
      <h2>The Tail Wag Myth</h2>
      <p>A wagging tail does not always mean a happy dog. A relaxed, sweeping wag means happiness, but a stiff, high, and rapid wag can indicate high arousal or aggression. A low, tucked tail implies fear or submission.</p>

      <h2>Ears and Posture</h2>
      <p>When a dog's ears are pinned flat against its head, it feels scared or threatened. Ears perked up and facing forward mean high alert or interest. A \"play bow\" (front legs flat on the ground, rear end up in the air) is a universal dog sign declaring that whatever comes next is entirely in play.</p>
    `
  },
  {
    id: "5",
    slug: "basic-obedience-training",
    title: "5 Essential Commands Every Dog Should Know",
    category: "training",
    excerpt: "Sit, Stay, Come, Down, Leave It — master these basics and build a strong foundation with your pet.",
    readTime: "10 min read",
    tags: ["Training", "Dogs", "Beginner"],
    content: `
      <h2>The Foundation of a Good Relationship</h2>
      <p>Training isn't just about obedience; it's about clear communication. Positive reinforcement (rewarding good behavior rather than punishing bad) is the most effective and humane way to train.</p>

      <h2>The Big Five</h2>
      <ul>
        <li><strong>1. Sit:</strong> The easiest command to teach. Hold a treat near their nose, move your hand up and back until their rear hits the floor, and say \"Sit\".</li>
        <li><strong>2. Come (Recall):</strong> The most potentially life-saving command. Always heavily reward them for coming when called. Never punish a dog after they come to you.</li>
        <li><strong>3. Stay:</strong> Crucial for keeping them out of trouble. Build up duration and distance very slowly.</li>
        <li><strong>4. Drop It / Leave It:</strong> Very important when they find toxic items (like chocolate dropped on the floor). Teach them that \"leaving\" a low-value item earns them a high-value treat.</li>
        <li><strong>5. Down:</strong> Helps them settle in chaotic environments. A dog in a \"down\" position is naturally calmer.</li>
      </ul>
    `
  },
  {
    id: "6",
    slug: "grooming-at-home",
    title: "DIY Pet Grooming: A Step-by-Step Guide",
    category: "grooming",
    excerpt: "Save money and bond with your pet by learning proper bathing, nail trimming, and coat care at home.",
    readTime: "9 min read",
    tags: ["Grooming", "DIY", "Bathing"],
    content: `
      <h2>Brushing is 90% of Grooming</h2>
      <p>Regular brushing removes dirt, prevents painful mats, and distributes natural skin oils. For long-haired pets, it's a daily necessity. Always brush *before* a bath, as water will tighten mats and make them impossible to comb out later.</p>

      <h2>The Bath Process</h2>
      <p>Always use pet-specific shampoo, as human shampoo disrupts their acid mantle and causes skin irritation. Use lukewarm water, and avoid getting water directly into their ears and eyes (you can place a cotton ball gently in the ear canal to prevent water from entering).</p>

      <h2>Nail Trimming</h2>
      <p>Many pet owners dread this. The key is avoiding the \"quick\" (the pink vein inside the nail). If you have a dog with black nails, clip tiny amounts at a time until you see a black dot in the center of the nail — that's your sign to stop.</p>
    `
  },
  {
    id: "7",
    slug: "rabies-prevention",
    title: "Rabies in the Philippines: What Every Pet Owner Must Know",
    category: "health",
    excerpt: "Rabies kills thousands annually. Here's how vaccination and responsible ownership can eliminate this threat.",
    readTime: "5 min read",
    tags: ["Rabies", "Vaccination", "Public Health"],
    content: `
      <h2>The Threat</h2>
      <p>The Philippines remains one of the top countries with high rabies prevalence. Rabies is a viral disease that attacks the central nervous system, and once clinical signs appear, it is 100% fatal in both pets and humans.</p>

      <h2>Your Legal Obligation</h2>
      <p>The Anti-Rabies Act of 2007 mandates that all dogs must be vaccinated annually. As an owner, you are legally responsible for bites incidents involving an unvaccinated pet.</p>

      <h2>If Your Pet is Bitten</h2>
      <p>If your pet is bitten by a stray or unknown animal, thoroughly wash the wound immediately with soap and running water for 10-15 minutes, then rush them to the vet. Even if they are vaccinated, they may require a booster shot and quarantine.</p>
    `
  },
  {
    id: "8",
    slug: "pet-poisoning-guide",
    title: "Common Household Items That Are Toxic to Pets",
    category: "first_aid",
    excerpt: "Chocolate, onions, certain plants — know the dangers lurking in your home and what to do if your pet ingests them.",
    readTime: "6 min read",
    tags: ["Poisoning", "Emergency", "Safety"],
    content: `
      <h2>Kitchen Hazards</h2>
      <p>Human food isn't always safe. Avoid giving any scraps containing:</p>
      <ul>
        <li><strong>Onions & Garlic:</strong> Destroys red blood cells leading to anemia.</li>
        <li><strong>Grapes & Raisins:</strong> Highly toxic to dogs; can cause sudden kidney failure.</li>
        <li><strong>Xylitol:</strong> An artificial sweetener found in gum and peanut butter. Causes a massive insulin crash and liver failure.</li>
      </ul>

      <h2>Household Chemicals</h2>
      <p>Antifreeze, bleach, strong floor cleaners, and rodent poisons are lethal. Even human medications like ibuprofen or paracetamol are toxic—never give human painkillers to pets.</p>

      <h2>Toxic Plants</h2>
      <p>Many popular indoor and garden plants are poisonous. Lilies, for example, are so toxic to cats that just licking the pollen off their fur can cause irreversible kidney failure.</p>
    `
  },
  {
    id: "9",
    slug: "cat-behavior-scratching",
    title: "Why Your Cat Scratches Furniture (And How to Stop It)",
    category: "behavior",
    excerpt: "Scratching is natural for cats. Learn how to redirect this behavior without stressing your feline friend.",
    readTime: "5 min read",
    tags: ["Cats", "Behavior", "Tips"],
    content: `
      <h2>Why They Do It</h2>
      <p>Scratching isn't a malicious attempt to ruin your couch. It's a deeply ingrained instinct. Cats scratch to stretch their muscles, shed the dead outer layers of their claws, and mark territory both visually and with scent glands in their paws.</p>

      <h2>The Redirection Method</h2>
      <p>You cannot stop a cat from scratching; you can only tell them *where* to scratch. Place sturdy scratching posts immediately next to the furniture they target. Make sure the post is tall enough for them to fully extended their body.</p>

      <h2>Deterrents</h2>
      <p>Apply double-sided sticky tape or aluminum foil to the corners of the couch—cats hate the texture. Once they realize the couch is unpleasant but the scratching post right next to it feels great, they will naturally redirect their behavior.</p>
    `
  }
];
