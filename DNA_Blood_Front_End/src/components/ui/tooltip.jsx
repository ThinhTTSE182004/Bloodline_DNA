import React from "react"

const TooltipProvider = ({ children }) => {
  return <div className="relative">{children}</div>
}

const Tooltip = ({ children, delay = 200 }) => {
  return <div className="relative" data-delay={delay}>{children}</div>
}

const TooltipTrigger = React.forwardRef(({ asChild, className, ...props }, ref) => {
  if (asChild) {
    return React.cloneElement(props.children, { ref, ...props })
  }
  return <div ref={ref} className={className} {...props} />
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef(({ 
  className, 
  side = "top",
  align = "center",
  ...props 
}, ref) => {
  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  }
  
  const alignClasses = {
    start: "left-0 -translate-x-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0 translate-x-0"
  }
  
  return (
    <div
      ref={ref}
      className={`absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 ${sideClasses[side]} ${alignClasses[align]} ${className}`}
      {...props}
    />
  )
})
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } 