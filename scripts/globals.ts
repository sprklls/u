export const globals = {
    constants: {
        globalCircleRadius: 10,
        minOffset: 1,
        maxOffset: 5,
        scaleFactor: 0.05,
        initV: 2,
        ctx: null as CanvasRenderingContext2D | null,
        // that's the only one that can be changed ^ 
    },

    dependent: {
        loadedAssets: false,
        dot_color: "rgb(255, 150, 150)",
        line_color: 'rgb(255, 150, 150)',
    }
  };