import { Users, ShoppingCart, Eye } from "lucide-react";

export function StatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="stat-card">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Views</p>
            <h3 className="text-3xl font-bold mt-2">31</h3>
            <p className="text-sm mt-2">+3 last day</p>
          </div>
          <Eye className="h-8 w-8 opacity-80" />
        </div>
      </div>
      
      <div className="stat-card clients">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Clients</p>
            <h3 className="text-3xl font-bold mt-2">63</h3>
            <p className="text-sm mt-2">+1 last day</p>
          </div>
          <Users className="h-8 w-8 opacity-80" />
        </div>
      </div>
      
      <div className="stat-card purchases">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-600">Purchases</p>
            <h3 className="text-3xl font-bold mt-2">10</h3>
            <p className="text-sm mt-2 text-gray-600">+1 last day</p>
          </div>
          <ShoppingCart className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    </div>
  );
}