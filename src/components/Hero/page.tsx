"use client";
import React, { useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";

const content = [
    {
      heading: "iRescue: Η Λύση για το Κινητό σου",
      description:
        "Επισκευή, πώληση ή αγορά μεταχειρισμένων κινητών με ευκολία και αξιοπιστία. Χωρίς φυσικό κατάστημα, αλλά με γρήγορη και απρόσκοπτη εξυπηρέτηση!",
      button: "Μάθε Περισσότερα",
    },
    {
      heading: "Δωρεάν Εκτίμηση & Μεταφορικά",
      description:
        "Αποκτήστε μια δωρεάν εκτίμηση για την επισκευή ή την πώληση της συσκευής σας. Παίρνουμε και φέρνουμε το κινητό σας χωρίς χρέωση!",
      button: "Ζήτα Εκτίμηση",
    },
    {
      heading: "Eco Friendly",
      description:
        "Δώστε μια δεύτερη ευκαιρία στο κινητό σας. Μην το πετάξετε! Είμαστε υπέρμαχοι της ανακύκλωσης.",
      button: "Μάθε Περισσότερα",
    },
    {
      heading: "Αξιοπιστία & Επαγγελματισμός",
      description:
        "Επισκευές από ειδικούς με πολλά χρόνια εμπειρίας. Εμπιστευτείτε μας τη συσκευή σας!",
      button: "Επισκευή Κινητού",
    },
  ];

const ONE_SECOND: number = 1000;
const AUTO_DELAY: number = ONE_SECOND * 5;
const DRAG_BUFFER: number = 50;

const SPRING_OPTIONS = {
  type: "spring",
  mass: 3,
  stiffness: 400,
  damping: 50,
};

export const SwipeCarousel: React.FC = () => {
  const [cardIndex, setCardIndex] = useState<number>(0);

  const dragX = useMotionValue<number>(0);

  useEffect(() => {
    const intervalRef = setInterval(() => {
      const x = dragX.get();

      if (x === 0) {
        setCardIndex((pv: number) => {
          if (pv === content.length - 1) {
            return 0;
          }
          return pv + 1;
        });
      }
    }, AUTO_DELAY);

    return () => clearInterval(intervalRef);
  }, [dragX]);

  const onDragEnd = () => {
    const x = dragX.get();

    if (x <= -DRAG_BUFFER && cardIndex < content.length - 1) {
      setCardIndex((pv: number) => pv + 1);
    } else if (x >= DRAG_BUFFER && cardIndex > 0) {
      setCardIndex((pv: number) => pv - 1);
    }
  };

  return (
    <div className="relative h-[calc(100vh-140px)] overflow-hidden bg-gray-900 rounded-3xl">
      <motion.div
        drag="x"
        dragConstraints={{
          left: 0,
          right: 0,
        }}
        style={{
          x: dragX,
        }}
        animate={{
          translateX: `-${cardIndex * 100}%`,
        }}
        transition={SPRING_OPTIONS}
        onDragEnd={onDragEnd}
        className="flex h-full cursor-grab items-center active:cursor-grabbing"
      >
        <Cards cardIndex={cardIndex} />
      </motion.div>

      <Dots cardIndex={cardIndex} setCardIndex={setCardIndex} />
      <GradientEdges />
    </div>
  );
};
  
  interface CardsProps {
    cardIndex: number;
  }

  const Cards: React.FC<CardsProps> = ({ cardIndex }) => {
    return (
      <>
        {content.map((card, idx) => {
          return (
            <motion.div
              key={idx}
              style={{
                backgroundImage: `url(/${idx + 1}.png)`, // Dynamic background image
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              animate={{
                scale: cardIndex === idx ? 0.95 : 0.85,
              }}
              transition={SPRING_OPTIONS}
              className="aspect-video h-full w-screen shrink-0 rounded-xl bg-gray-900 object-cover flex items-center justify-center"
            >
              
            </motion.div>
          );
        })}
      </>
    );
  };

interface DotsProps {
  cardIndex: number;
  setCardIndex: (index: number) => void;
}

const Dots: React.FC<DotsProps> = ({ cardIndex, setCardIndex }) => {
  return (
    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 justify-center gap-2">
      {content.map((_, idx) => {
        return (
          <button
            key={idx}
            onClick={() => setCardIndex(idx)}
            className={`h-3 w-3 rounded-full transition-colors ${
              idx === cardIndex ? "bg-purple-600" : "bg-neutral-500"
            }`}
          />
        );
      })}
    </div>
  );
};

const GradientEdges: React.FC = () => {
  return (
    <>
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-[10vw] max-w-[100px] bg-gradient-to-r from-neutral-950/30 to-neutral-950/0" />
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-[10vw] max-w-[100px] bg-gradient-to-l from-neutral-950/30 to-neutral-950/0" />
    </>
  );
};