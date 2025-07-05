import React from "react"

const Avatar = React.forwardRef(({ className, size = "default", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  }
  
  return (
    <div
      ref={ref}
      className={`relative flex shrink-0 overflow-hidden rounded-full ${sizeClasses[size]} ${className}`}
      {...props}
    />
  )
})
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <img ref={ref} className={`aspect-square h-full w-full object-cover ${className}`} {...props} />
))
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground ${className}`}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback } 