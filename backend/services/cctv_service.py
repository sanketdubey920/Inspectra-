import io
import time
from datetime import datetime, timezone
import cv2
import numpy as np

class CCTVService:
    """
    CCTV & OpenCV Video Signal Simulation Service.
    Generates video frames with real-time HUD (Institute, Room, Timestamp, Activity Index, Occupancy telemetry)
    and computes operational activity signals for the Risk Engine.
    """

    @staticmethod
    def generate_simulated_frame(institute_name: str, room_name: str, activity_level: float = 75.0, occupancy: int = 18) -> bytes:
        # Create a 640x360 canvas representing CCTV frame
        height, width = 360, 640
        # Dark realistic camera background with subtle gradient
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame[:] = (25, 30, 35)

        # Draw room perspective lines / classroom or office silhouettes
        cv2.rectangle(frame, (40, 100), (600, 320), (45, 50, 58), -1)
        cv2.line(frame, (40, 100), (120, 20), (60, 65, 75), 2)
        cv2.line(frame, (600, 100), (520, 20), (60, 65, 75), 2)
        cv2.rectangle(frame, (120, 20), (520, 100), (35, 40, 48), -1)

        # Draw simulated human bounding boxes based on occupancy
        np.random.seed(int(time.time() * 2) % 1000)
        num_boxes = min(occupancy, 8)
        for i in range(num_boxes):
            bx = 80 + i * 65 + np.random.randint(-5, 6)
            by = 160 + (i % 2) * 40 + np.random.randint(-5, 6)
            bw, bh = 38, 75
            # Draw person outline / bounding box
            color = (0, 220, 130) if activity_level > 40 else (0, 140, 255)
            cv2.rectangle(frame, (bx, by), (bx + bw, by + bh), color, 1)
            cv2.putText(frame, f"P_{i+1}", (bx, by - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.35, color, 1)

        # Header HUD
        cv2.rectangle(frame, (0, 0), (width, 40), (15, 20, 25), -1)
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
        cv2.putText(frame, f"INSPECTRA CCTV | {institute_name.upper()} | {room_name.upper()}", (15, 25),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)
        
        # Timestamp & Status on Right
        cv2.putText(frame, f"{now_str} [LIVE]", (width - 240, 25),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 255, 0), 1, cv2.LINE_AA)

        # Bottom Telemetry Bar
        cv2.rectangle(frame, (0, height - 35), (width, height), (15, 20, 25), -1)
        activity_status = "NORMAL" if activity_level >= 50 else "UNUSUAL INACTIVITY"
        telemetry_text = f"Activity Level: {activity_level:.1f}% | Est. Occupancy: {occupancy} | Status: {activity_status}"
        color_status = (0, 255, 120) if activity_level >= 50 else (0, 100, 255)
        cv2.putText(frame, telemetry_text, (15, height - 12),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.40, color_status, 1, cv2.LINE_AA)
        
        # Privacy watermark
        cv2.putText(frame, "AUTHORIZED GOVT ACCESS ONLY", (width - 240, height - 12),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.35, (120, 120, 120), 1, cv2.LINE_AA)

        # Encode frame to JPEG
        ret, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        return jpeg.tobytes()

    @staticmethod
    def calculate_activity_signal(frames_list) -> float:
        """
        OpenCV optical flow / frame difference calculation.
        Computes motion index across sequential frames.
        """
        if len(frames_list) < 2:
            return 70.0
        
        prev_gray = cv2.cvtColor(frames_list[0], cv2.COLOR_BGR2GRAY)
        curr_gray = cv2.cvtColor(frames_list[1], cv2.COLOR_BGR2GRAY)
        diff = cv2.absdiff(prev_gray, curr_gray)
        _, thresh = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)
        non_zero_count = cv2.countNonZero(thresh)
        total_pixels = thresh.shape[0] * thresh.shape[1]
        motion_pct = (non_zero_count / total_pixels) * 100.0
        return float(min(100.0, motion_pct * 10.0))
