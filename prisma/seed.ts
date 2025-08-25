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
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create regular user
  const userPassword = await hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: userPassword,
      role: 'USER',
    },
  })

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
 { name: 'Ola ola 1.8kg poundo', price: 15.99, category: 'Flours', stock: 50 },
 { name: 'Olu olu poundo 600g', price: 3.99, category: 'Flours', stock: 50 },
 { name: 'Olu olu poundo 1.2kg', price: 6.99, category: 'Flours', stock: 50 },
 { name: 'Africa direct oat flour', price: 3.99, category: 'Cereals', stock: 50 },
 { name: 'Tropical sun mashed potato (5kg)', price: 15.99, category: 'Tubers', stock: 50 },
 { name: 'African harvest poundo 4kg', price: 13.99, category: 'Flours', stock: 50 },
 { name: 'Grandios pap(white/yellow/brown)', price: 3.49, category: 'Cereals', stock: 50 },
 { name: 'Cornstarch 800g', price: 3.99, category: 'Flours', stock: 50 },
 { name: 'Geisha Mackerel', price: 2.99, category: 'Fish', stock: 50 },
 { name: 'Ginger paste', price: 2.99, category: 'Frozen Items', stock: 50 },
 { name: 'Garlic paste', price: 1.49, category: 'Frozen Items', stock: 50 },
 { name: 'Ginger and garlic paste', price: 2.99, category: 'Frozen Items', stock: 50 },
 { name: 'Ghana taste peanut paste', price: 2.99, category: 'Sauces', stock: 50 },
 { name: 'Ghana best peanut butter', price: 2.99, category: 'Sauces', stock: 50 },
 { name: 'Africa finest peanut butter', price: 2.99, category: 'Sauces', stock: 50 },
 { name: 'Nigeria taste banga soup base 400g', price: 3.99, category: 'Soup Mixes', stock: 50 },
 { name: 'Papa choice banga', price: 3.99, category: 'Soup Mixes', stock: 50 },
 { name: 'Abemudro (praise)palm soup', price: 3.99, category: 'Soup Mixes', stock: 50 },
 { name: 'Trofai palmnut base', price: 3.99, category: 'Soup Mixes', stock: 50 },
 { name: 'Ghana best palm nut soup', price: 3.99, category: 'Soup Mixes', stock: 50 },
 { name: 'Topman yam poundo(100%)yam', price: 14.99, category: 'Flours', stock: 50 },
 { name: 'Yellow garri 4kg', price: 7.99, category: 'Flours', stock: 50 },
 { name: 'Yellow garri 5kg', price: 10.99, category: 'Flours', stock: 50 },
 { name: 'Yellow garri 1.5kg', price: 3.49, category: 'Flours', stock: 50 },
 { name: 'Yellow garri 20kg', price: 28.00, category: 'Flours', stock: 50 },
 { name: 'Papa choice poundo 8kg', price: 21.99, category: 'Flours', stock: 50 },
 { name: 'Papa\'s choice poundo 4kg', price: 12.99, category: 'Flours', stock: 50 },
 { name: 'Ayoola plantain flour 0.9kg', price: 3.99, category: 'Flours', stock: 50 },
 { name: 'Ayoola poundo yam 4.5kg', price: 17.99, category: 'Flours', stock: 50 },
 { name: 'Olu olu poundo 4kg', price: 15.99, category: 'Flours', stock: 50 },
 { name: 'Ola ola poundo 4.535kg', price: 34.99, category: 'Flours', stock: 50 },
 { name: 'Spaghetti (morrison)', price: 0.99, category: 'Grains', stock: 50 },
 { name: 'Plantain fufu 1kg', price: 2.49, category: 'Flours', stock: 50 },
 { name: 'Papa\'s choice lafun 4kg', price: 6.99, category: 'Flours', stock: 50 },
 { name: 'Ayoola poundo 1.8kg', price: 8.99, category: 'Flours', stock: 50 },
 { name: 'Cerelac-6,7,12 months', price: 8.99, category: 'Cereals', stock: 50 },
 { name: 'Powermalt', price: 19.99, category: 'Drinks', stock: 50 },
 { name: 'Virginia coconut oil', price: 2.99, category: 'Oils', stock: 50 },
 { name: 'Banana green', price: 1.99, category: 'Fruits', stock: 50 },
 { name: 'Green plantain', price: 1.99, category: 'Fruits', stock: 50 },
 { name: 'Ripe plantain', price: 1.99, category: 'Fruits', stock: 50 },
 { name: 'Red onions', price: 4.49, category: 'Vegetables', stock: 50 },
 { name: 'White onions', price: 3.49, category: 'Vegetables', stock: 50 },
 { name: 'Plantain chips', price: 16.99, category: 'Snacks', stock: 50 },
 { name: 'Belleful indomie', price: 16.99, category: 'Grains', stock: 50 },
 { name: 'Catfish pack', price: 12.00, category: 'Fish', stock: 50 },
 { name: 'Plum tomato', price: 0.85, category: 'Vegetables', stock: 50 },
 { name: 'Chopped tomato', price: 0.85, category: 'Vegetables', stock: 50 },
 { name: 'Redbull (small)', price: 0.89, category: 'Drinks', stock: 50 },
 { name: 'Fayrouz', price: 1.00, category: 'Drinks', stock: 50 },
 { name: 'Limca', price: 1.50, category: 'Drinks', stock: 50 },
 { name: 'Graceco Yellow ogi', price: 3.49, category: 'Cereals', stock: 50 },
 { name: 'Graeco white ogi', price: 3.49, category: 'Cereals', stock: 50 },
 { name: 'Pan maiz', price: 2.99, category: 'Grains', stock: 50 },
 { name: 'Donkwa', price: 3.99, category: 'Snacks', stock: 50 },
 { name: 'Maggi liquid seasoning', price: 1.49, category: 'Seasonings', stock: 50 },
 { name: 'Water guard', price: 2.99, category: 'Toiletries', stock: 50 },
 { name: 'Ghana banku', price: 3.99, category: 'Flours', stock: 50 },
 { name: 'Ghana taste hausa koko', price: 1.99, category: 'Cereals', stock: 50 },
 { name: 'Golden penny butter spread', price: 4.99, category: 'Sauces', stock: 50 },
 { name: 'Golden penny cube sugar', price: 4.99, category: 'Seasonings', stock: 50 },
 { name: 'St Louis', price: 4.99, category: 'Seasonings', stock: 50 },
 { name: 'Aromat', price: 1.99, category: 'Seasonings', stock: 50 },
 { name: 'Hot dog sausages', price: 2.99, category: 'Fish', stock: 50 },
 { name: 'Puff puff mix', price: 4.99, category: 'Flours', stock: 50 },
 { name: 'Buns mix', price: 4.99, category: 'Flours', stock: 50 },
 { name: 'Egusi soup seasoning', price: 1.99, category: 'Seasonings', stock: 50 },
 { name: 'Gino curry sachet', price: 0.25, category: 'Spices', stock: 50 },
 { name: 'Gino thyme', price: 0.25, category: 'Spices', stock: 50 },
 { name: 'Damatol', price: 2.99, category: 'Toiletries', stock: 50 },
 { name: 'Ball pepper', price: 11.50, category: 'Vegetables', stock: 50 },
 { name: 'Green hot pepper', price: 13.00, category: 'Vegetables', stock: 50 },
 { name: 'Green ball pepper', price: 11.00, category: 'Vegetables', stock: 50 },
 { name: 'Ginger (Chinese)', price: 2.99, category: 'Roots', stock: 50 },
 { name: 'Ginger (local)', price: 2.99, category: 'Roots', stock: 50 },
 { name: 'Turmeric', price: 6.99, category: 'Roots', stock: 50 },
 { name: 'Red hot pepper', price: 1.00, category: 'Vegetables', stock: 50 },
 { name: 'Soursop', price: 10.99, category: 'Fruits', stock: 50 },
 { name: 'Papaya', price: 4.99, category: 'Fruits', stock: 50 },
 { name: 'Water yam (ikokore)', price: 3.99, category: 'Tubers', stock: 50 },
 { name: 'Yam', price: 55.00, category: 'Tubers', stock: 50 },
 { name: 'Coconut', price: 1.20, category: 'Fruits', stock: 50 },
 { name: 'Cassava', price: 1.99, category: 'Tubers', stock: 50 },
 { name: 'Cocoyam', price: 3.99, category: 'Tubers', stock: 50 },
 { name: 'Sweet potato (red and white)', price: 3.99, category: 'Tubers', stock: 50 },
 { name: 'Kirkland water by 40', price: 6.99, category: 'Drinks', stock: 50 },
 { name: 'Iwiza 2kg', price: 3.99, category: 'Grains', stock: 50 },
 { name: 'Iwiza 5kg', price: 7.99, category: 'Grains', stock: 50 },
 { name: 'Iwiza 10kg', price: 12.99, category: 'Grains', stock: 50 },
 { name: 'Whole egusi 400g', price: 3.99, category: 'Vegetables', stock: 50 },
 { name: 'Egusi ground 100g', price: 1.99, category: 'Vegetables', stock: 50 },
 { name: 'Egusi ground 200g', price: 2.99, category: 'Vegetables', stock: 50 },
 { name: 'Egusi ground 400g', price: 4.99, category: 'Vegetables', stock: 50 },
 { name: '20kg egusi', price: 70.00, category: 'Vegetables', stock: 50 },
 { name: 'Whole prawn(dried)', price: 2.99, category: 'Seafood', stock: 50 },
 { name: 'Stockfish steak', price: 3.99, category: 'Fish', stock: 50 },
 { name: 'White crayfish 70g', price: 2.99, category: 'Seafood', stock: 50 },
 { name: 'Grinded hot pepper', price: 2.99, category: 'Spices', stock: 50 },
 { name: 'Fresh scent leaf', price: 2.50, category: 'Vegetables', stock: 50 },
 { name: 'Dried stockfish tusk', price: 2.49, category: 'Fish', stock: 50 },
 { name: 'Alum 100g', price: 1.99, category: 'Seasonings', stock: 50 },
 { name: 'Whole smoked prawn', price: 3.49, category: 'Seafood', stock: 50 },
 { name: 'Suya kebab powder', price: 1.49, category: 'Spices', stock: 50 },
 { name: 'Grounded crayfish', price: 2.99, category: 'Seafood', stock: 50 },
 { name: 'Smoked prawns ground', price: 2.99, category: 'Seafood', stock: 50 },
 { name: 'Kilishi', price: 3.99, category: 'Snacks', stock: 50 },
 { name: 'Bayleaf', price: 1.99, category: 'Spices', stock: 50 },
 { name: 'Tom tom', price: 1.29, category: 'Seasonings', stock: 50 },
 { name: 'Stock fish head', price: 32.00, category: 'Fish', stock: 50 },
 { name: 'Caramel peanut', price: 2.99, category: 'Snacks', stock: 50 },
 { name: 'Avocado', price: 4.50, category: 'Fruits', stock: 50 },
 { name: 'Mangoes', price: 11.99, category: 'Fruits', stock: 50 },
 { name: 'Spinach', price: 0.89, category: 'Vegetables', stock: 50 },
 { name: 'Watermelon', price: 1.49, category: 'Fruits', stock: 50 },
 { name: 'Fresh peanut', price: 6.99, category: 'Snacks', stock: 50 },
 { name: 'Garlic', price: 0.99, category: 'Roots', stock: 50 },
 { name: 'Aloe vera', price: 2.99, category: 'Roots', stock: 50 },
 { name: 'Fresh scotch bonnet', price: 6.50, category: 'Vegetables', stock: 50 },
 { name: 'Yellow pepper', price: 1.99, category: 'Vegetables', stock: 50 },
 { name: 'Turning spoon(big)', price: 9.99, category: 'Toiletries', stock: 50 },
 { name: 'Iwa akara(big)', price: 9.99, category: 'Toiletries', stock: 50 }
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
          `https://res.cloudinary.com/dl3xqgqde/image/upload/v1751935149/default1_pbh9zi.jpg`
        ],
        categoryId: categoryId,
        stock: product.stock,
      },
    })
  }

  // Create a sample address for orders
  const address = await prisma.address.upsert({
    where: { id: 'sample-address' },
    update: {},
    create: {
      id: 'sample-address',
      userId: user.id,
      street: '123 Victoria Island',
      city: 'Lagos',
      state: 'Lagos State',
      postalCode: '101001',
      country: 'Nigeria',
      isDefault: true,
    },
  })

  // Create sample orders
  const createdProducts = await prisma.product.findMany()
  const statuses = Object.values(OrderStatus)

  // Generate 50 sample orders
  for (let i = 0; i < 50; i++) {
    // Generate a random date within the last 30 days
    const randomDays = Math.floor(Math.random() * 30)
    const randomHours = Math.floor(Math.random() * 24)
    const randomMinutes = Math.floor(Math.random() * 60)
    const orderDate = addMinutes(
      addHours(subDays(new Date(), randomDays), randomHours),
      randomMinutes
    )

    // Randomly select 2-4 products for the order
    const numItems = Math.floor(Math.random() * 3) + 2 // 2-4 items
    const selectedProducts = [...createdProducts]
      .sort(() => 0.5 - Math.random())
      .slice(0, numItems)

    // Calculate total order value
    const orderItems = selectedProducts.map((product) => ({
      productId: product.id,
      quantity: Math.floor(Math.random() * 3) + 1, // 1-3 quantity
      price: product.price,
    }))

    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Create the order
    await prisma.order.create({
      data: {
        userId: user.id,
        addressId: address.id,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        total,
        createdAt: orderDate,
        items: {
          create: orderItems,
        },
      },
    })
  }

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
  