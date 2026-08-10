
function Sidebar() {
    return (
        <div className="flex flex-col w-1/6 p-2">
            <p className="text-2xl font-bold text-left w-full p-2 mb-2">Model Router</p>
            <button className="flex flex-row w-full p-2 mb-2 border-2 text-left rounded-md justify-between ">Chat <p className="text-gray-400 text-sm">new chat</p></button>
            <div className="flex flex-col w-full p-2 mb-2 overflow-y-auto h-96">
                <p>history</p>
                <p>history</p>
                <p>history</p>
                <p>history</p>
                <p>history</p>
                <p>history</p>
                <p>history</p>
                <p>history</p>
                <p>history</p>
                <p>history</p>
                <p>history</p>
            </div>
        </div>
    )
}

function chatSection() {
    return (
        <div className="flex flex-col w-1/2 justify-center p-2">
            <chatInput />

        </div>
    )
}

function chatInput() {
    return (
        <div>
            <input type="text" placeholder="Message" />
            <button>Send</button>
        </div>
    )
}

export const Landing = () => {
    return (
        <div>
            <Sidebar />
            <chatSection />
            <chatInput />
        </div>
    )
}