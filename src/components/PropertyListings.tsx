import { MoreVertical } from "lucide-react";

const properties = [
  { name: "Windmills Loft", progress: 25, image: "/lovable-uploads/4cc8436f-df56-4de5-bfef-21460fb3adfd.png" },
  { name: "Seaview Villa", progress: 18, image: "/lovable-uploads/4cc8436f-df56-4de5-bfef-21460fb3adfd.png" },
  { name: "Family Villa", progress: 12, image: "/lovable-uploads/4cc8436f-df56-4de5-bfef-21460fb3adfd.png" },
];

export function PropertyListings() {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <button className="px-4 py-1 rounded-full bg-blue-50 text-sm">Objects</button>
          <button className="px-4 py-1 rounded-full text-sm text-gray-500">Realtors</button>
        </div>
        <button><MoreVertical className="h-5 w-5 text-gray-400" /></button>
      </div>
      
      {properties.map((property) => (
        <div key={property.name} className="property-card">
          <div className="flex items-center gap-4">
            <img 
              src={property.image} 
              alt={property.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <span>{property.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">{property.progress}%</span>
            <div className="w-24 h-1 bg-gray-700 rounded-full">
              <div 
                className="h-full bg-blue-400 rounded-full"
                style={{ width: `${property.progress}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}