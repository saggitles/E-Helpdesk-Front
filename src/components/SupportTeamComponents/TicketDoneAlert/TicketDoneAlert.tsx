import React from 'react';

export default function TicketDoneAlert() {
    const AlertTicket = () => {
        return (
            <div id="crud-modal" tabIndex={-1} aria-hidden="true" className="overflow-y-auto overflow-x-hidden fixed flex items-center left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div className="relative p-4 w-full max-w-2xl max-h-full">
                    <div className="relative rounded-lg shadow bg-white">
                        <div className="flex items-center justify-between pt-5 px-5">
                            <h3 className="text-xl font-semibold text-teal-400">
                                Closing Ticket
                            </h3>
                            <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-toggle="crud-modal">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        <form className="px-5 py-4">
                            <div className="grid gap-4 mb-4 grid-cols-2">
                                <div className="col-span-2 flex items-center gap-2 border-b border-gray-100">
                                    <label htmlFor="category" className="block mb-2 text-sm font-semibold text-gray-400 pt-2">Notify</label>
                                    <select id="category" className="text-gray-900 text-sm rounded-lg max-w-34 p-2.5 border-none">
                                        <option value="" selected={true}><strong>Jhon smith</strong> <span className="text-gray-400">(jhonsmith@test.com)</span></option>
                                        <option value="TV">William Sanchez <span className="text-gray-400">(williamlopez0721@test.com)</span></option>
                                        <option value="PC">PC</option>
                                        <option value="GA">Gaming/Console</option>
                                        <option value="PH">Phones</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label htmlFor="description" className="block mb-2 text-sm font-semibold text-gray-400">Solution</label>
                                    <textarea id="description" rows={4} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500" placeholder="Write product description here"></textarea>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <div>
                                    <button type="submit" className="text-gray-400 inline-flex items-center hover:bg-teal-400 hover:text-gray-50 border border-gray-200 focus:ring-4 focus:outline-none font-medium rounded-full text-sm px-5 py-1.5 uppercase text-center">
                                        Help
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <button type="submit" className="text-white inline-flex items-center bg-teal-400 hover:bg-teal-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1.5 text-center">
                                        SEND
                                    </button>
                                    <button type="button" className="text-white inline-flex items-center bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1.5 text-center">
                                        CANCEL
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    return <AlertTicket />;
}
