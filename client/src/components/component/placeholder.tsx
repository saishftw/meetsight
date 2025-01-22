function Placeholder({ text }: { text: string }) {
    return (
        <p className="flex justify-center items-center text-center flex-nowrap rounded-md border border-gray-200 px-2 py-1 text-xs md:text-sm text-gray-500 mb-2">{text}</p>
    )
}

export default Placeholder