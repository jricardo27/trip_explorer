import { useRef, useCallback, useEffect } from 'react';

const TOUCH_MOVE_TOLERANCE = 10; // pixels

interface LongPressOptions {
  onLongPress: (event: React.TouchEvent | React.MouseEvent) => void;
  duration?: number;
}

export const useLongPress = (
  callback: (event: React.TouchEvent | React.MouseEvent) => void,
  duration: number = 500
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);
  
  // Store the latest callback in a ref to avoid re-creating event handlers
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startPositionRef.current = null; // Reset start position when timer is cleared
  }, []);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    clearTimer(); // Clear any existing timer
    
    // Store the starting position of the touch
    const touch = event.touches[0];
    startPositionRef.current = { x: touch.clientX, y: touch.clientY };

    timerRef.current = setTimeout(() => {
      // event.persist() // Not needed in React 17+ for synthetic events if accessed async, but good to be aware of.
      // For this case, we pass the original event object to the callback.
      // If callback were to access event properties asynchronously *after* this event handler finishes,
      // and if React were to recycle the event, then persisting would be needed.
      // However, we are calling the callback synchronously within the setTimeout.
      callbackRef.current(event);
      event.preventDefault(); // Prevent default actions like text selection or drag-scroll
      event.stopPropagation(); // Stop event from bubbling up
      startPositionRef.current = null; // Reset position after long press triggered
    }, duration);
  }, [duration, clearTimer]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!startPositionRef.current) {
      return;
    }

    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - startPositionRef.current.x);
    const deltaY = Math.abs(touch.clientY - startPositionRef.current.y);

    if (deltaX > TOUCH_MOVE_TOLERANCE || deltaY > TOUCH_MOVE_TOLERANCE) {
      clearTimer();
    }
  }, [clearTimer]);

  const handleTouchEnd = useCallback(() // Removed event: React.TouchEvent as it's not used
  ) => {
    clearTimer();
  }, [clearTimer]);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    // Prevent the default context menu, which can be triggered by long press on some mobile browsers
    // or right-click on desktop.
    event.preventDefault();
    // As per prompt, only preventDefault. If we wanted context menu to also trigger long press:
    // clearTimer(); // Clear any touch-based timer
    // callbackRef.current(event); // Trigger callback
    // event.stopPropagation();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onContextMenu: handleContextMenu,
    // Also include mouse events for desktop "long press" like behavior (optional but good UX)
    // onMouseDown: (event: React.MouseEvent) => {
    //   // Only handle left click for mouse down long press
    //   if (event.button === 0) {
    //     handleTouchStart(event as any); // Cast to any or create a common handler
    //   }
    // },
    // onMouseUp: handleTouchEnd,
    // onMouseMove: (event: React.MouseEvent) => {
    //    if (event.buttons === 1) { // If left button is pressed
    //      handleTouchMove(event as any); // Cast to any or create a common handler
    //    }
    // },
    // onMouseLeave: handleTouchEnd, // If mouse leaves the element
  };
};

// Example Usage (not part of the hook itself):
/*
import React from 'react';
import { useLongPress } from './useLongPress';

const MyComponent = () => {
  const onLongPress = React.useCallback((event) => {
    console.log('Long press detected!', event);
    alert('Long press!');
  }, []);

  const longPressProps = useLongPress(onLongPress, 500);

  return (
    <button {...longPressProps} style={{ width: 200, height: 200, background: 'lightblue' }}>
      Long Press Me
    </button>
  );
};
*/
