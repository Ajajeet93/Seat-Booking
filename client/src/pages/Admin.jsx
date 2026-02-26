import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Users as UsersIcon, ShieldCheck } from 'lucide-react';

const Admin = () => {
    const { user } = useContext(AuthContext);
    const [mockEmployees, setMockEmployees] = useState([
        { id: 1, name: "Alice", email: "alice@wissen.com", batch: 1, role: "EMPLOYEE" },
        { id: 2, name: "Bob", email: "bob@wissen.com", batch: 2, role: "EMPLOYEE" },
    ]);

    // Simple role guard
    if (user?.role !== 'ADMIN') {
        return <Navigate to="/" />;
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0 flex items-center">
                    <ShieldCheck className="w-8 h-8 text-blue-600 mr-3" />
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Admin Dashboard
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card p-6">
                    <div className="flex items-center mb-4">
                        <UsersIcon className="w-6 h-6 text-gray-400 mr-2" />
                        <h3 className="text-lg font-bold text-gray-900">Manage Employees</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {mockEmployees.map((emp) => (
                            <li key={emp.id} className="py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                                    <p className="text-sm text-gray-500">{emp.email}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.batch === 1 ? 'bg-indigo-100 text-indigo-800' : 'bg-pink-100 text-pink-800'}`}>
                                    Batch {emp.batch}
                                </span>
                                <span className="text-xs text-blue-600 cursor-pointer underline hover:text-blue-800">Edit</span>
                            </div>
                            </li>
                        ))}
                </ul>
                <button className="mt-4 w-full btn-primary btn-sm">Add New Employee</button>
            </div>

            <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Space Utilization</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                            <span>Batch 1 Designation (Today)</span>
                            <span>85% (17/20)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                            <span>Batch 2 Designation</span>
                            <span>40% (8/20)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-400 h-2 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                            <span>Floating Seats</span>
                            <span>100% (10/10)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div >
    );
};

export default Admin;
