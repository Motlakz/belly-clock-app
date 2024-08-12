const Loader = () => {
    return (
        <div className="loader-container flex justify-center items-center h-screen bg-black bg-opacity-50 fixed top-0 left-0 w-full z-50">
            <div className="loader flex justify-center gap-4 w-full">
                <div className="dot dot1"></div>
                <div className="dot dot2"></div>
                <div className="dot dot3"></div>
            </div>
        </div>
    );
};

export default Loader;
