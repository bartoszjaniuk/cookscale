import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
}

export const FadeIn = ({
  children,
  delay = 0,
  duration = 0.6,
  direction = "up",
  ...props
}: FadeInProps) => {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 30 : direction === "down" ? -30 : 0,
      x: direction === "left" ? 30 : direction === "right" ? -30 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration, delay, ease: "easeOut" as any },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({
  children,
  staggerDelay = 0.1,
  delayChildren = 0,
  ...props
}: HTMLMotionProps<"div"> & {
  staggerDelay?: number;
  delayChildren?: number;
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delayChildren,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  direction = "up",
  ...props
}: HTMLMotionProps<"div"> & {
  direction?: "up" | "down" | "left" | "right" | "none";
}) => {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 30 : direction === "down" ? -30 : 0,
      x: direction === "left" ? 30 : direction === "right" ? -30 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" as any },
    },
  };

  return (
    <motion.div variants={variants} {...props}>
      {children}
    </motion.div>
  );
};

export const FloatingElement = ({
  children,
  delay = 0,
  duration = 4,
  yOffset = 15,
  ...props
}: HTMLMotionProps<"div"> & {
  delay?: number;
  duration?: number;
  yOffset?: number;
}) => {
  return (
    <motion.div
      animate={{
        y: [0, -yOffset, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const HeroFloatingCard = ({
  children,
  delay = 0,
  direction = "left",
  ...props
}: HTMLMotionProps<"div"> & {
  delay?: number;
  direction?: "left" | "right";
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0.1,
        scale: 0.8,
        x: direction === "left" ? 100 : -100, // Zaczyna bliżej środka
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
        x: 0, // Rozjeżdża się na docelową pozycję CSS
        y: 0,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 20,
          delay,
        },
      }}
      viewport={{ once: true, margin: "-50px" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
