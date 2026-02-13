import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface Route {
  id: number;
  name: string;
  driver: {
    name: string;
  };
  bus_id: number;
  started_at: string;
  ended_at: string | null;
  distance?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        fetchRoutes();
    }, [refreshTrigger]);

    const fetchRoutes = async () => {
        try {
            const response = await fetch('/api/routes');
            const data = await response.json();
            
            if (data.success) {
                setRoutes(data.routes.data || []);
            }
        } catch (error) {
            console.error('Error fetching routes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="School Bus Tracker Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">School Bus Tracker Dashboard</h1>
                    <button 
                        onClick={handleRefresh}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Refresh
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Routes List Panel */}
                    <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Routes</h2>
                        
                        {loading ? (
                            <p>Loading routes...</p>
                        ) : (
                            <ul className="space-y-2 max-h-96 overflow-y-auto">
                                {routes.length > 0 ? (
                                    routes.map(route => (
                                        <li 
                                            key={route.id} 
                                            className={`p-3 rounded cursor-pointer ${selectedRoute?.id === route.id ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'}`}
                                            onClick={() => setSelectedRoute(route)}
                                        >
                                            <div className="font-medium">{route.name}</div>
                                            <div className="text-sm text-gray-600">
                                                Driver: {route.driver?.name || 'N/A'} | Bus: {route.bus_id}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Started: {new Date(route.started_at).toLocaleString()}
                                                {route.ended_at && ` | Ended: ${new Date(route.ended_at).toLocaleString()}`}
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <p>No routes available</p>
                                )}
                            </ul>
                        )}
                    </div>
                    
                    {/* Map Visualization Panel */}
                    <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">
                            {selectedRoute ? `Route: ${selectedRoute.name}` : 'Select a Route to View'}
                        </h2>
                        
                        {selectedRoute ? (
                            <div className="h-96 bg-gray-100 rounded relative">
                                <iframe 
                                    src={`/route-map/${selectedRoute.id}`} 
                                    width="100%" 
                                    height="100%" 
                                    frameBorder="0"
                                    title="Route Map"
                                    className="rounded"
                                ></iframe>
                            </div>
                        ) : (
                            <div className="h-96 bg-gray-100 rounded flex items-center justify-center">
                                <p>Select a route to view its map</p>
                            </div>
                        )}
                        
                        {/* Route Details */}
                        {selectedRoute && (
                            <div className="mt-4">
                                <h3 className="text-lg font-medium mb-2">Route Details</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="font-medium">Driver:</span> {selectedRoute.driver?.name || 'N/A'}</div>
                                    <div><span className="font-medium">Bus ID:</span> {selectedRoute.bus_id}</div>
                                    <div><span className="font-medium">Started:</span> {new Date(selectedRoute.started_at).toLocaleString()}</div>
                                    <div>
                                        <span className="font-medium">Status:</span> 
                                        {selectedRoute.ended_at 
                                            ? `Ended at ${new Date(selectedRoute.ended_at).toLocaleString()}` 
                                            : 'Active'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
