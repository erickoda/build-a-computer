import { z } from "zod";

const positiveFpsString = (message: string) =>
  z.string().min(1, message).refine((v) => !isNaN(Number(v)) && Number(v) > 0, message);

export const createBenchmarkSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255, "Title must be at most 255 characters long"),
    gpu_id: z.string().min(1, "Select a GPU"),
    cpu_id: z.string().min(1, "Select a CPU"),
    ram_id: z.string().min(1, "Select RAM"),
    game_id: z.string().min(1, "Select a game"),
    resolution: z.string().min(1, "Select a resolution"),
    graphics_quality: z.string().min(1, "Select a quality preset"),
    avg_fps: positiveFpsString("Enter a valid avg FPS"),
    min_fps: positiveFpsString("Enter a valid min FPS"),
    max_fps: positiveFpsString("Enter a valid max FPS"),
    score: z.string().refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0), "Enter a valid score").optional(),
  })
  .refine((data) => Number(data.min_fps) <= Number(data.avg_fps), {
    message: "Min FPS should be ≤ avg FPS",
    path: ["min_fps"],
  })
  .refine((data) => Number(data.max_fps) >= Number(data.avg_fps), {
    message: "Max FPS should be ≥ avg FPS",
    path: ["max_fps"],
  });

export type CreateBenchmarkFormValues = z.infer<typeof createBenchmarkSchema>;
