"use client";


import { useEffect, useState } from "react";

export default function Page() { // Capitalized 'Page'


    const [user, setUser] = useState<{
        name: string;
        role: string;
        email: string;
        address: string
    } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                setUser(null);
            }
        }
    }, []);



    return (
        <div className="flex h-screen bg-gray-50">
            {/* <Sidebar darkMode={false} /> */}

            <div className="flex-1 px-6 py-4 ">
                <div className="max-w-4xl mx-auto h-[90vh] overflow-auto">

                    <div className="rounded-lg p-6 mb-6 border bg-[#ffffff] border-[#dcdcdc]">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                                    <span className="text-white font-bold text-2xl"> {user?.name?.charAt(0).toUpperCase() ?? "?"}</span>
                                </div>
                            </div>
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl font-bold">{user?.name ?? "Loading..."}</h2>
                                <p className="text-gray-400">{user?.role ?? "User"}</p>
                                <p className="text-sm text-gray-500 mt-1">Member since January 2024</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border mb-6 border-[#dcdcdc] bg-[#ffffff]">
                        <div className="flex border-b border-[#dcdcdc]">
                            <button className="px-6 py-4 text-sm font-medium transition-colors text-blue-500 border-b-2 border-blue-500">Personal Information</button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input className="w-full px-3 py-2 rounded-lg border bg-[#fffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" value={user?.name ?? ""} />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Date of Birth <span className="text-red-500">*</span>
                                        </label>
                                        <input className="w-full px-3 py-2 rounded-lg border bg-[#fffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500" type="date" value="" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Email
                                        </label>
                                        <input disabled className="w-full px-3 py-2 rounded-lg border text-[#909090] bg-[#ebebeb] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500" type="email" value={user?.email ?? ""} />
                                    </div>

                                     <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Address
                                        </label>
                                        <input className="w-full px-3 py-2 rounded-lg border text-[#909090] bg-[#ffffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500" type="text" value={user?.address ?? ""} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Bio</label>
                                    <textarea rows="4" className="w-full px-3 py-2 rounded-lg border bg-[#fffff] border-[#dcdcdc] focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tell us about yourself..."></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end pt-6 border-t border-gray-700">
                                <button className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-6 rounded-lg transition-colors font-medium flex items-center gap-2">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
