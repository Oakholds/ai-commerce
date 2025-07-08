import Image from 'next/image'
import prisma from '@/lib/prisma'
import { LatestProducts } from '@/components/home/latest-products'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Link from 'next/link'

async function getLatestProducts() {
  return await prisma.product.findMany({
    take: 8,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      reviews: true,
    },
  })
}

export default async function HomePage() {
  const latestProducts = await getLatestProducts()

  const bannerItems = [
        {
      image: 'https://res.cloudinary.com/dl3xqgqde/image/upload/v1751935148/home_byqnwo.png',
      title: 'Welcome to 03FoodStore',
      description: 'Your one-stop shop for authentic African groceries, spices, and traditional foods delivered fresh to your door',
      badge: 'Premium Quality',
      color: 'from-purple-600 to-indigo-700'
    },
    {
      image: 'https://res.cloudinary.com/dl3xqgqde/image/upload/v1751935151/image3_fn52pk.png',
      title: 'Fresh Yam & Fufu Collection',
      description: 'Premium quality yam flour, fufu flakes, and poundo yam from Nigeria',
      badge: 'Authentic African',
      color: 'from-amber-600 to-orange-700'
    },
    {
      image: 'https://res.cloudinary.com/dl3xqgqde/image/upload/v1751935151/spice_pj6edu.png',
      title: 'Traditional Spices & Seasonings',
      description: 'Knorr cubes, Maggi crayfish, curry powder & authentic African seasonings',
      badge: 'Rich Flavors',
      color: 'from-red-600 to-pink-700'
    },
    {
      image: 'https://res.cloudinary.com/dl3xqgqde/image/upload/v1751935150/plantain_pdqzyj.png',
      title: 'Plantain Chips & Snacks',
      description: 'Crispy Olu olu & Asiko plantain chips, biscuits and traditional treats',
      badge: 'Healthy Snacks',
      color: 'from-green-600 to-emerald-700'
    },
    {
      image: 'https://res.cloudinary.com/dl3xqgqde/image/upload/v1751935150/drinks_ou5cnj.png',
      title: 'Refreshing Beverages',
      description: 'Supermalt cans & bottles, palm wine, and traditional African drinks',
      badge: 'Refreshing',
      color: 'from-blue-600 to-teal-700'
    },
  ]

  return (
    <div className='space-y-8 mt-6'>
      <section className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='relative'>
          {/* Store Header */}
          {/* <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>
              🍽️ African Food Market
            </h1>
            <p className='text-lg text-gray-600'>
              Authentic African ingredients & traditional foods delivered fresh
            </p>
          </div> */}

          <Carousel
            opts={{
              loop: true,
            }}
            className='w-full'
          >
            <CarouselContent>
              {bannerItems.map((item, index) => (
                <CarouselItem key={index}>
                  <div className='relative aspect-[21/9] w-full overflow-hidden rounded-2xl border-4 border-white shadow-2xl'>
                    {/* Background Pattern */}
                    <div className='absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50'>
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={1500}
                        height={10}
                        className='object-contain rounded-lg'
                        // sizes='(max-width: 768px) 200px, 256px'
                      />
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className='absolute top-4 left-4 w-16 h-16 bg-yellow-400 rounded-full opacity-20'></div>
                    <div className='absolute bottom-4 right-4 w-12 h-12 bg-green-400 rounded-full opacity-20'></div>
                    <div className='absolute top-1/2 right-8 w-8 h-8 bg-red-400 rounded-full opacity-20'></div>
                    
                    {/* Main Image Placeholder */}
                    {/* <div className='absolute right-8 top-1/2 -translate-y-1/2 w-64 h-48 bg-white rounded-xl shadow-lg border-4 border-orange-200 opacity-90'>
                      <div className='w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center'>
                        <div className='text-6xl'>                      
                        <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className='object-cover rounded-lg'
                        sizes='(max-width: 768px) 200px, 256px'
                      /></div>
                      </div>
                    </div> */}

                    {/* Content Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10`}>
                    </div>
                    
                    {/* Text Content */}
                    <div className='absolute inset-0 flex flex-col justify-center px-8 md:px-12 text-white bg-black/30 rounded-2xl'>
  <div className='max-w-2xl'>
    {/* Badge */}
    <div className='inline-block mb-4'>
      <span className='bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full text-sm font-medium'>
        {item.badge}
      </span>
    </div>

    {/* Title */}
    <h2 className='text-3xl md:text-5xl font-bold mb-4 leading-tight'>
      {item.title}
    </h2>

    {/* Description */}
    <p className='text-lg md:text-xl text-white/90 mb-6 leading-relaxed'>
      {item.description}
    </p>

    {/* CTA Button */}
    <button className='bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg'>
      Shop Now →
    </button>
  </div>
</div>

                    {/* Decorative Food Icons */}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation Buttons */}
            <CarouselPrevious className='left-4 md:left-8 bg-white/90 hover:bg-white border-2 border-orange-200 text-orange-700 h-12 w-12 shadow-lg' />
            <CarouselNext className='right-4 md:right-8 bg-white/90 hover:bg-white border-2 border-orange-200 text-orange-700 h-12 w-12 shadow-lg' />
          </Carousel>

{/* Featured Categories */}
<div className='mt-12 grid grid-cols-2 md:grid-cols-4 gap-4'>
  <Link href='/products?category=cmctvcj63000dt05i32h43atb'>
    <div className='cursor-pointer bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-2xl text-white text-center shadow-lg'>
      <div className='text-3xl mb-2'>🍠</div>
      <h3 className='font-semibold'>Yam & Fufu</h3>
      <p className='text-sm opacity-90'>Traditional staples</p>
    </div>
  </Link>

  <Link href='/products?category=cmctvce9c0003t05i1tkql98j'>
    <div className='cursor-pointer bg-gradient-to-br from-red-500 to-pink-600 p-6 rounded-2xl text-white text-center shadow-lg'>
      <div className='text-3xl mb-2'>🌶️</div>
      <h3 className='font-semibold'>Spices & Seasonings</h3>
      <p className='text-sm opacity-90'>Rich flavors</p>
    </div>
  </Link>

  <Link href='/products?category=cmctvck5g000ft05i81kwbloz'>
    <div className='cursor-pointer bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white text-center shadow-lg'>
      <div className='text-3xl mb-2'>🍌</div>
      <h3 className='font-semibold'>Plantain Chips</h3>
      <p className='text-sm opacity-90'>Healthy snacks</p>
    </div>
  </Link>

  <Link href='/products?category=cmctvckmg000gt05ih1m8sx9w'>
    <div className='cursor-pointer bg-gradient-to-br from-blue-500 to-teal-600 p-6 rounded-2xl text-white text-center shadow-lg'>
      <div className='text-3xl mb-2'>🥤</div>
      <h3 className='font-semibold'>Beverages</h3>
      <p className='text-sm opacity-90'>Refreshing drinks</p>
    </div>
  </Link>
</div>
        </div>
      </section>

      <LatestProducts products={latestProducts} />
    </div>
  )
}