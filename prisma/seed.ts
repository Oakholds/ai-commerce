/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient, OrderStatus } from '@prisma/client'
import { hash } from 'bcryptjs'
import { subDays, addHours, addMinutes } from 'date-fns'

const prisma = new PrismaClient()

async function main() {

await prisma.orderItem.deleteMany()
await prisma.order.deleteMany()
await prisma.product.deleteMany()
await prisma.category.deleteMany()
  // Create admin user
  // const adminPassword = await hash('admin123', 12)
  // const admin = await prisma.user.upsert({
  //   where: { email: 'admin@example.com' },
  //   update: {},
  //   create: {
  //     email: 'admin@example.com',
  //     name: 'Admin User',
  //     password: adminPassword,
  //     role: 'ADMIN',
  //   },
  // })

  // Create regular user
  // const userPassword = await hash('user123', 12)
  // const user = await prisma.user.upsert({
  //   where: { email: 'user@example.com' },
  //   update: {},
  //   create: {
  //     email: 'user@example.com',
  //     name: 'Regular User',
  //     password: userPassword,
  //     role: 'USER',
  //   },
  // })

  // Create categories
  const categories = [
    {
      name: 'Flours',
      description: 'Popular African swallows like poundo, garri, amala, fufu',
      image: '/images/categories/flours.jpg',
    },
    {
      name: 'Spices',
      description: 'Aromatic spices for traditional African meals',
      image: '/images/categories/spices.jpg',
    },
    {
      name: 'Seasonings',
      description: 'Cooking cubes, powders, and soup enhancers',
      image: '/images/categories/seasonings.jpg',
    },
    {
      name: 'Grains',
      description: 'Essential grains like rice, cornmeal, and ogi',
      image: '/images/categories/grains.jpg',
    },
    {
      name: 'Cereals',
      description: 'Pap, oat flour, and breakfast grains',
      image: '/images/categories/cereals.jpg',
    },
    {
      name: 'Oils',
      description: 'Palm oil, coconut oil, and cooking oils',
      image: '/images/categories/oils.jpg',
    },
    {
      name: 'Sauces',
      description: 'Palmnut base, soup blends, and paste mixes',
      image: '/images/categories/sauces.jpg',
    },
    {
      name: 'Fish',
      description: 'Smoked fish, dried catfish, and stockfish',
      image: '/images/categories/fish.jpg',
    },
    {
      name: 'Seafood',
      description: 'Prawns, crayfish, and shellfish',
      image: '/images/categories/seafood.jpg',
    },
    {
      name: 'Vegetables',
      description: 'Fresh spinach, scent leaf, okra, and more',
      image: '/images/categories/vegetables.jpg',
    },
    {
      name: 'Fruits',
      description: 'Mangoes, avocado, soursop, bananas',
      image: '/images/categories/fruits.jpg',
    },
    {
      name: 'Tubers',
      description: 'Yam, cocoyam, cassava, sweet potato',
      image: '/images/categories/tubers.jpg',
    },
    {
      name: 'Roots',
      description: 'Ginger, turmeric, garlic, aloe vera',
      image: '/images/categories/roots.jpg',
    },
    {
      name: 'Snacks',
      description: 'Plantain chips, kilishi, peanuts, donkwa',
      image: '/images/categories/snacks.jpg',
    },
    {
      name: 'Drinks',
      description: 'Supermalt, Red Bull, palmwine, Fayrouz',
      image: '/images/categories/drinks.jpg',
    },
    {
      name: 'Toiletries',
      description: 'Toothpaste, body wash, antiseptics',
      image: '/images/categories/toiletries.jpg',
    },
    {
      name: 'Soup Mixes',
      description: 'Egusi mix, peanut base, pepper blends',
      image: '/images/categories/soupmix.jpg',
    },
    {
      name: 'Frozen Items',
      description: 'Garlic paste, ginger paste, preserved goods',
      image: '/images/categories/frozen.jpg',
    },
  ]

  // Create categories in database
  const categoryMap = new Map()
  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
    categoryMap.set(category.name, createdCategory.id)
  }

  // Define products with their categories
  const products = [
    // Kitchen Tools & Utensils
    { name: 'Redhill Turning spoon(big)', category: 'Snacks', price: 5.99, stock: 50 },
    { name: 'Iwa akara(big)', category: 'Snacks', price: 8.99, stock: 30 },
    
    // Water & Beverages
    { name: 'Kirkland water by 40', category: 'Drinks', price: 15.99, stock: 100 },
    { name: 'Redbull', category: 'Drinks', price: 2.99, stock: 200 },
    { name: 'Fayrouz', category: 'Drinks', price: 2.49, stock: 150 },
    { name: 'Limca', category: 'Drinks', price: 2.49, stock: 150 },
    { name: 'Supermalt can', category: 'Drinks', price: 2.99, stock: 100 },
    { name: 'Supermalt bottle', category: 'Drinks', price: 3.99, stock: 80 },
    { name: 'Palmwine/emu', category: 'Drinks', price: 8.99, stock: 40 },
    
    // Flours & Staples
    { name: 'Iwiza 2kg', category: 'Flours', price: 12.99, stock: 60 },
    { name: 'Iwiza 5kg', category: 'Flours', price: 29.99, stock: 40 },
    { name: 'Iwiza 10kg', category: 'Flours', price: 55.99, stock: 25 },
    { name: 'Yellow garri 4kg', category: 'Flours', price: 18.99, stock: 50 },
    { name: 'Yellow garri 5kg', category: 'Flours', price: 22.99, stock: 45 },
    { name: 'Yellow garri 1:5kg', category: 'Flours', price: 7.99, stock: 80 },
    { name: 'Yellow garri 20kg', category: 'Flours', price: 89.99, stock: 15 },
    { name: 'Topman yam poundo(100%)yam', category: 'Flours', price: 24.99, stock: 35 },
    { name: 'Papa choice poundo 8kg', category: 'Flours', price: 42.99, stock: 20 },
    { name: 'Papa\'s choice poundo 4kg', category: 'Flours', price: 22.99, stock: 40 },
    { name: 'Ayoola plantain flour 0.9kg', category: 'Flours', price: 8.99, stock: 60 },
    { name: 'Ayoola poundo yam 4:5kg', category: 'Flours', price: 25.99, stock: 30 },
    { name: 'Olu olu poundo 4kg', category: 'Flours', price: 23.99, stock: 35 },
    { name: 'Ola ola poundo 4.535kg', category: 'Flours', price: 26.99, stock: 30 },
    { name: 'Plantain fufu 1kg', category: 'Flours', price: 9.99, stock: 50 },
    { name: 'Papa\'s choice lafun 4kg', category: 'Flours', price: 21.99, stock: 25 },
    { name: 'Ayoola poundo 1.8kg', category: 'Flours', price: 12.99, stock: 45 },
    { name: 'African harvest poundo 4kg', category: 'Flours', price: 24.99, stock: 30 },
    { name: 'Ola ola 1.8kg poundo', category: 'Flours', price: 13.99, stock: 40 },
    { name: 'Olu olu poundo 600g', category: 'Flours', price: 5.99, stock: 70 },
    { name: 'Olu olu poundo 1.2kg', category: 'Flours', price: 9.99, stock: 55 },
    { name: 'Fufu flakes 4kg', category: 'Flours', price: 22.99, stock: 30 },
    { name: 'Ayoola poundo 9.1kg', category: 'Flours', price: 49.99, stock: 15 },
    { name: 'African harvest poundo 1.5kg', category: 'Flours', price: 11.99, stock: 45 },
    { name: 'Papa choice what flour', category: 'Flours', price: 16.99, stock: 35 },
    { name: 'Nigeria taste poundo 1kg', category: 'Flours', price: 7.99, stock: 60 },
    { name: 'Nigeria taste poundo 1.5kg', category: 'Flours', price: 10.99, stock: 50 },
    { name: 'Lafun 1.5kg', category: 'Flours', price: 9.99, stock: 40 },
    { name: 'Yam flour 4kg', category: 'Flours', price: 23.99, stock: 25 },
    { name: 'Nigeria taste poundo 4kg', category: 'Flours', price: 24.99, stock: 20 },
    { name: 'Papa\'s choice pounded yam 1.5kg', category: 'Flours', price: 12.99, stock: 35 },
    { name: 'African harvest plantain fufu', category: 'Flours', price: 14.99, stock: 30 },
    { name: 'Tapioca', category: 'Flours', price: 6.99, stock: 45 },
    
    // Grains & Cereals
    { name: 'Yellow ogi', category: 'Cereals', price: 4.99, stock: 80 },
    { name: 'Graeco white ogi', category: 'Cereals', price: 4.99, stock: 80 },
    { name: 'Pan maiz', category: 'Cereals', price: 3.99, stock: 100 },
    { name: 'Grandios pap(white/yellow/brown)', category: 'Cereals', price: 6.99, stock: 60 },
    { name: 'Africa direct oat flour', category: 'Cereals', price: 8.99, stock: 40 },
    { name: 'Tropical sun mashed potato (5kg)', category: 'Cereals', price: 28.99, stock: 20 },
    { name: 'Topical sun mashed potato 1.5kg', category: 'Cereals', price: 9.99, stock: 45 },
    { name: 'Spaghetti (morrison)', category: 'Grains', price: 2.99, stock: 100 },
    { name: 'Belleville indomie', category: 'Grains', price: 1.99, stock: 200 },
    
    // Egusi & Seeds
    { name: 'Whole egusi 400g', category: 'Spices', price: 12.99, stock: 40 },
    { name: 'Egusi ground 100g', category: 'Spices', price: 4.99, stock: 80 },
    { name: 'Egusi ground 200g', category: 'Spices', price: 8.99, stock: 60 },
    { name: 'Egusi ground 400g', category: 'Spices', price: 15.99, stock: 40 },
    { name: '20kg egusi', category: 'Spices', price: 189.99, stock: 5 },
    
    // Seafood
    { name: 'Whole prawn(dried)', category: 'Seafood', price: 18.99, stock: 30 },
    { name: 'Stockfish steak', category: 'Fish', price: 25.99, stock: 25 },
    { name: 'While crayfish 70g', category: 'Seafood', price: 8.99, stock: 50 },
    { name: 'Dried stockfish tusk', category: 'Fish', price: 22.99, stock: 20 },
    { name: 'Whole smoked prawn', category: 'Seafood', price: 16.99, stock: 35 },
    { name: 'Grounded crayfish', category: 'Seafood', price: 12.99, stock: 45 },
    { name: 'Smoked prawns ground', category: 'Seafood', price: 15.99, stock: 40 },
    { name: 'Stock fish head', category: 'Fish', price: 28.99, stock: 15 },
    { name: 'Catfish pack', category: 'Fish', price: 19.99, stock: 25 },
    { name: 'Geisha Mackerel', category: 'Fish', price: 3.99, stock: 100 },
    { name: 'Smoked catfish fillet', category: 'Fish', price: 24.99, stock: 20 },
    
    // Spices & Seasonings
    { name: 'Grinded hot pepper', category: 'Spices', price: 6.99, stock: 70 },
    { name: 'Suya kebab powder', category: 'Spices', price: 4.99, stock: 60 },
    { name: 'Alum 100g', category: 'Spices', price: 2.99, stock: 80 },
    { name: 'Bayleaf', category: 'Spices', price: 3.99, stock: 90 },
    { name: 'Whole chilli pepper', category: 'Spices', price: 5.99, stock: 55 },
    { name: 'Jamaican curry powder', category: 'Spices', price: 7.99, stock: 45 },
    { name: 'Ajinomoto 500g', category: 'Seasonings', price: 8.99, stock: 40 },
    { name: 'Aromat powder 1.1kg', category: 'Seasonings', price: 12.99, stock: 30 },
    { name: 'Maggi liquid seasoning', category: 'Seasonings', price: 3.99, stock: 80 },
    { name: 'St Louis Aromat', category: 'Seasonings', price: 5.99, stock: 60 },
    { name: 'Egusi soup seasoning', category: 'Seasonings', price: 4.99, stock: 50 },
    { name: 'Gino curry satchet', category: 'Seasonings', price: 1.99, stock: 100 },
    { name: 'Gino thyme', category: 'Seasonings', price: 2.99, stock: 80 },
    { name: 'Tilapia seasoning', category: 'Seasonings', price: 3.99, stock: 60 },
    { name: 'Taste cubes chicken flavour seasoning powder 1kg', category: 'Seasonings', price: 9.99, stock: 35 },
    { name: 'Lotus 100g', category: 'Seasonings', price: 2.99, stock: 70 },
    { name: 'Knorr beef', category: 'Seasonings', price: 1.99, stock: 120 },
    { name: 'Knorr chicken', category: 'Seasonings', price: 1.99, stock: 120 },
    { name: 'Chicken flavour tasty cubes 320g/80g', category: 'Seasonings', price: 4.99, stock: 60 },
    { name: 'Maggi crayfish', category: 'Seasonings', price: 2.99, stock: 80 },
    
    // Fresh Vegetables
    { name: 'Fresh scent leaf', category: 'Vegetables', price: 3.99, stock: 40 },
    { name: 'Spinach', category: 'Vegetables', price: 2.99, stock: 50 },
    { name: 'Red onions', category: 'Vegetables', price: 3.99, stock: 60 },
    { name: 'White onions', category: 'Vegetables', price: 3.99, stock: 60 },
    { name: 'Plum tomato', category: 'Vegetables', price: 4.99, stock: 45 },
    { name: 'Chopped tomato', category: 'Vegetables', price: 3.99, stock: 50 },
    
    // Fruits
    { name: 'Avacado', category: 'Fruits', price: 2.99, stock: 40 },
    { name: 'Mangoes', category: 'Fruits', price: 4.99, stock: 50 },
    { name: 'Watermelon', category: 'Fruits', price: 8.99, stock: 25 },
    { name: 'Soursop', category: 'Fruits', price: 6.99, stock: 30 },
    { name: 'Papaya', category: 'Fruits', price: 5.99, stock: 35 },
    { name: 'Banana green', category: 'Fruits', price: 3.99, stock: 60 },
    { name: 'Green plantain', category: 'Fruits', price: 4.99, stock: 50 },
    { name: 'Rile plantain', category: 'Fruits', price: 5.99, stock: 45 },
    { name: 'Dried fruit', category: 'Fruits', price: 7.99, stock: 40 },
    
    // Tubers
    { name: 'Wateryam (ikokore)', category: 'Tubers', price: 12.99, stock: 20 },
    { name: 'Yam', category: 'Tubers', price: 15.99, stock: 25 },
    { name: 'Coconut', category: 'Tubers', price: 3.99, stock: 40 },
    { name: 'Cassava', category: 'Tubers', price: 8.99, stock: 30 },
    { name: 'Cocoyam', category: 'Tubers', price: 9.99, stock: 25 },
    { name: 'Sweet potato (red and white)', category: 'Tubers', price: 6.99, stock: 35 },
    
    // Roots & Herbs
    { name: 'Fresh peanut', category: 'Roots', price: 4.99, stock: 60 },
    { name: 'Garlic', category: 'Roots', price: 5.99, stock: 80 },
    { name: 'Aloe vera', category: 'Roots', price: 3.99, stock: 40 },
    { name: 'Fresh scotch bonnet', category: 'Roots', price: 2.99, stock: 70 },
    { name: 'Yellow pepper', category: 'Roots', price: 3.99, stock: 50 },
    { name: 'Ball pepper', category: 'Roots', price: 3.99, stock: 50 },
    { name: 'Green hot pepper', category: 'Roots', price: 2.99, stock: 60 },
    { name: 'green ball pepper', category: 'Roots', price: 3.99, stock: 50 },
    { name: 'Ginger (Chinese )', category: 'Roots', price: 6.99, stock: 45 },
    { name: 'Ginger(local)', category: 'Roots', price: 4.99, stock: 55 },
    { name: 'Turmeric', category: 'Roots', price: 7.99, stock: 40 },
    { name: 'Red hot pepper', category: 'Roots', price: 2.99, stock: 65 },
    { name: 'Weakness leaves', category: 'Roots', price: 5.99, stock: 30 },
    
    // Snacks
    { name: 'Plantain chips', category: 'Snacks', price: 4.99, stock: 80 },
    { name: 'Kilishi', category: 'Snacks', price: 12.99, stock: 35 },
    { name: 'Caramel peanut', category: 'Snacks', price: 5.99, stock: 60 },
    { name: 'Donkwa', category: 'Snacks', price: 3.99, stock: 50 },
    { name: 'Olu olu plantain chips', category: 'Snacks', price: 4.99, stock: 70 },
    { name: 'Asiko plantain chips', category: 'Snacks', price: 4.99, stock: 70 },
    { name: 'Maliban gem bisc8', category: 'Snacks', price: 2.99, stock: 100 },
    { name: 'Hot dog sausages', category: 'Snacks', price: 6.99, stock: 40 },
    { name: 'Puff puff mix', category: 'Snacks', price: 3.99, stock: 60 },
    { name: 'Buns mix', category: 'Snacks', price: 3.99, stock: 60 },
    
    // Oils & Fats
    { name: 'Virginia coconut oil', category: 'Oils', price: 15.99, stock: 30 },
    { name: 'Golden penny butter spread', category: 'Oils', price: 4.99, stock: 50 },
    
    // Soup Bases & Sauces
    { name: 'Ghana taste peanut paste', category: 'Soup Mixes', price: 8.99, stock: 40 },
    { name: 'Ghana best peanut butter', category: 'Soup Mixes', price: 7.99, stock: 45 },
    { name: 'Africa finest peanut butter', category: 'Soup Mixes', price: 8.99, stock: 40 },
    { name: 'Nigeria taste bangalore soup base 400g', category: 'Soup Mixes', price: 12.99, stock: 30 },
    { name: 'Nkulenu palmsoup base', category: 'Soup Mixes', price: 10.99, stock: 35 },
    { name: 'Papa choice banga', category: 'Soup Mixes', price: 9.99, stock: 40 },
    { name: 'Abemudro (praise)palm soup', category: 'Soup Mixes', price: 11.99, stock: 30 },
    { name: 'Trofai palmnut base', category: 'Soup Mixes', price: 10.99, stock: 35 },
    { name: 'Ghana best palm nut soup', category: 'Soup Mixes', price: 12.99, stock: 30 },
    { name: 'Ghana banku', category: 'Soup Mixes', price: 6.99, stock: 50 },
    { name: 'Ghana taste hausa koko', category: 'Soup Mixes', price: 5.99, stock: 45 },
    
    // Frozen Items
    { name: 'Ginger paste', category: 'Frozen Items', price: 6.99, stock: 40 },
    { name: 'Garlic paste', category: 'Frozen Items', price: 6.99, stock: 40 },
    { name: 'Ginger and garlic paste', category: 'Frozen Items', price: 7.99, stock: 35 },
    
    // Toiletries
    { name: 'Damatol(all sizes)', category: 'Toiletries', price: 8.99, stock: 50 },
    { name: 'Water guard', category: 'Toiletries', price: 3.99, stock: 80 },
    { name: 'Honey', category: 'Toiletries', price: 9.99, stock: 40 },
    { name: 'Close up(blue/red)', category: 'Toiletries', price: 2.99, stock: 100 },
    { name: 'Pepsodent', category: 'Toiletries', price: 2.99, stock: 100 },
    { name: 'Magazine body wash', category: 'Toiletries', price: 5.99, stock: 60 },
    
    // Miscellaneous
    { name: 'Cornstarch 800g', category: 'Grains', price: 4.99, stock: 70 },
    { name: 'Ceramic 6,7,12 months', category: 'Drinks', price: 25.99, stock: 20 },
    { name: 'Powermalt', category: 'Drinks', price: 4.99, stock: 60 },
    { name: 'Golden penny cube sugar', category: 'Seasonings', price: 3.99, stock: 80 },
    { name: 'Weakness powder', category: 'Seasonings', price: 6.99, stock: 40 },
    { name: 'Date powder', category: 'Spices', price: 5.99, stock: 45 },
  ]

  // Create products in database
  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const categoryId = categoryMap.get(product.category)
    
    if (!categoryId) {
      console.warn(`Category ${product.category} not found for product ${product.name}`)
      continue
    }

    await prisma.product.upsert({
      where: { id: `product-${i + 1}` },
      update: {},
      create: {
        id: `product-${i + 1}`,
        name: product.name,
        description: `Premium quality ${product.name.toLowerCase()} sourced from trusted suppliers`,
        price: product.price,
        images: [
          `/images/default1.jpg`
        ],
        categoryId: categoryId,
        stock: product.stock,
      },
    })
  }

  // Create a sample address for orders
  // const address = await prisma.address.upsert({
  //   where: { id: 'sample-address' },
  //   update: {},
  //   create: {
  //     id: 'sample-address',
  //     userId: user.id,
  //     street: '123 Victoria Island',
  //     city: 'Lagos',
  //     state: 'Lagos State',
  //     postalCode: '101001',
  //     country: 'Nigeria',
  //     isDefault: true,
  //   },
  // })

  // // Create sample orders
  // const createdProducts = await prisma.product.findMany()
  // const statuses = Object.values(OrderStatus)

  // // Generate 50 sample orders
  // for (let i = 0; i < 50; i++) {
  //   // Generate a random date within the last 30 days
  //   const randomDays = Math.floor(Math.random() * 30)
  //   const randomHours = Math.floor(Math.random() * 24)
  //   const randomMinutes = Math.floor(Math.random() * 60)
  //   const orderDate = addMinutes(
  //     addHours(subDays(new Date(), randomDays), randomHours),
  //     randomMinutes
  //   )

  //   // Randomly select 2-4 products for the order
  //   const numItems = Math.floor(Math.random() * 3) + 2 // 2-4 items
  //   const selectedProducts = [...createdProducts]
  //     .sort(() => 0.5 - Math.random())
  //     .slice(0, numItems)

  //   // Calculate total order value
  //   const orderItems = selectedProducts.map((product) => ({
  //     productId: product.id,
  //     quantity: Math.floor(Math.random() * 3) + 1, // 1-3 quantity
  //     price: product.price,
  //   }))

  //   const total = orderItems.reduce(
  //     (sum, item) => sum + item.price * item.quantity,
  //     0
  //   )

  //   // Create the order
  //   await prisma.order.create({
  //     data: {
  //       userId: user.id,
  //       addressId: address.id,
  //       status: statuses[Math.floor(Math.random() * statuses.length)],
  //       total,
  //       createdAt: orderDate,
  //       items: {
  //         create: orderItems,
  //       },
  //     },
  //   })
  // }

  console.log(`Seed data created successfully:`)
  console.log(`- ${categories.length} categories`)
  console.log(`- ${products.length} products`)
  console.log(`- 50 sample orders`)
  console.log(`- 2 users (admin and regular user)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
  