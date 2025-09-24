import React, { useEffect, useState } from 'react';
import { getPublicLedger } from '../services/api';
import { Expenditure } from '../types';
import { Images, MapPin, CheckCircle2 } from 'lucide-react';

const PublicLedger: React.FC = () => {
    const [items, setItems] = useState<Expenditure[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await getPublicLedger();
            setItems(data);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Public Ledger</h1>
                <p className="text-gray-600 mb-6">All beneficiary-approved and completed expenditures are published here for transparency.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {items.map(exp => (
                        <div key={exp.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm text-gray-500">Project #{exp.projectId}</div>
                                <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" /> {exp.status.toUpperCase()}
                                </div>
                            </div>
                            <div className="font-medium text-gray-900">{exp.description}</div>
                            <div className="text-sm text-gray-600">Amount: ₹{exp.amount.toLocaleString()}</div>

                            {exp.vendorProof && (
                                <div className="mt-3">
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                        <Images className="h-4 w-4 mr-1" /> Proof
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {exp.vendorProof.images.slice(0, 4).map((img, idx) => (
                                            <img key={idx} src={img} alt="proof" className="h-16 w-24 object-cover rounded" />
                                        ))}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                                        <MapPin className="h-3 w-3" />
                                        {exp.vendorProof.location[0]}, {exp.vendorProof.location[1]} · {exp.vendorProof.timestamp.toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PublicLedger;


