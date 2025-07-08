import { Package, TrendingUp, AlertTriangle, DollarSign, BarChart3, Calendar, Target } from 'lucide-react'

interface ProductsStatsData {
  totalProducts: number
  totalValue: number
  lowStock: number
  outOfStock: number
  averagePrice?: number
  categoriesCount?: number
  recentProducts?: number
}

interface ProductsStatsProps {
  data: ProductsStatsData
}

export function ProductsStats({ data }: ProductsStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const stats = [
    {
      title: 'Total Products',
      value: formatNumber(data.totalProducts),
      icon: Package,
      description: 'Products in catalog',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      title: 'Total Value',
      value: formatCurrency(data.totalValue),
      icon: DollarSign,
      description: 'Total inventory value',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      title: 'Low Stock',
      value: formatNumber(data.lowStock),
      icon: TrendingUp,
      description: 'Products with low stock (≤10)',
      alert: data.lowStock > 0,
      color: data.lowStock > 0 ? 'text-yellow-600' : 'text-gray-600',
      bgColor: data.lowStock > 0 ? 'bg-yellow-50' : 'bg-gray-50',
      borderColor: data.lowStock > 0 ? 'border-yellow-200' : 'border-gray-200',
    },
    {
      title: 'Out of Stock',
      value: formatNumber(data.outOfStock),
      icon: AlertTriangle,
      description: 'Products out of stock',
      alert: data.outOfStock > 0,
      color: data.outOfStock > 0 ? 'text-red-600' : 'text-gray-600',
      bgColor: data.outOfStock > 0 ? 'bg-red-50' : 'bg-gray-50',
      borderColor: data.outOfStock > 0 ? 'border-red-200' : 'border-gray-200',
    },
  ]

  // Additional stats if available
  const additionalStats = []
  
  if (data.averagePrice !== undefined) {
    additionalStats.push({
      title: 'Average Price',
      value: formatCurrency(data.averagePrice),
      icon: Target,
      description: 'Average product price',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    })
  }

  if (data.categoriesCount !== undefined) {
    additionalStats.push({
      title: 'Categories',
      value: formatNumber(data.categoriesCount),
      icon: BarChart3,
      description: 'Product categories',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    })
  }

  if (data.recentProducts !== undefined) {
    additionalStats.push({
      title: 'Recent Products',
      value: formatNumber(data.recentProducts),
      icon: Calendar,
      description: 'Added in last 30 days',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
    })
  }

  const allStats = [...stats, ...additionalStats]

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`rounded-lg border p-6 shadow-sm transition-all hover:shadow-md ${
              stat.alert 
                ? 'border-destructive/50 bg-destructive/5' 
                : `${stat.bgColor} ${stat.borderColor}`
            }`}
          >
            <div className="flex items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-700">{stat.title}</h3>
              <stat.icon 
                className={`h-5 w-5 ${
                  stat.alert ? 'text-destructive' : stat.color
                }`} 
              />
            </div>
            <div className="space-y-1">
              <div className={`text-2xl font-bold ${
                stat.alert ? 'text-destructive' : stat.color
              }`}>
                {stat.value}
              </div>
              <p className="text-xs text-gray-500">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      {additionalStats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {additionalStats.map((stat) => (
            <div
              key={stat.title}
              className={`rounded-lg border p-4 shadow-sm transition-all hover:shadow-md ${stat.bgColor} ${stat.borderColor}`}
            >
              <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-gray-700">{stat.title}</h3>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="space-y-1">
                <div className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert Summary */}
      {(data.lowStock > 0 || data.outOfStock > 0) && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Inventory Alerts</h3>
          </div>
          <p className="mt-1 text-sm text-yellow-700">
            {data.outOfStock > 0 && `${data.outOfStock} product${data.outOfStock > 1 ? 's' : ''} out of stock`}
            {data.outOfStock > 0 && data.lowStock > 0 && ', '}
            {data.lowStock > 0 && `${data.lowStock} product${data.lowStock > 1 ? 's' : ''} running low`}
            . Consider restocking soon.
          </p>
        </div>
      )}
    </div>
  )
}