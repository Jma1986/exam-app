import React from "react"

export default function LinkButton({children, isActive, ...rest}) {
    let activeStyle = isActive === true ? "border-0 border-b-2 border-b-blue-500" : "";
    
    return (
        <button 
            className={`font-bold bg-transparent text-gray-900 ${activeStyle} border-blue-700 hover:border-b-2 hover:border-b-gray-300 px-3 py-2`} 
            {...rest}>
            {children}
        </button>
    );
}
