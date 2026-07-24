/**
 * useDemoVoiceCapture — graba audio del usuario, lo envía a /api/transcribe,
 * y dispara callbacks con la nota + transcripción.
 *
 * Extraído del monolito `ExerciseLabClient.tsx` (Codex). Sin cambios.
 */

"use client";

import { useRef, useState } from "react";
import type { VoiceRecState } from "./types";

export function useDemoVoiceCapture({
  onVoiceNote,
  onTranscript,
}: {
  onVoiceNote: (note: string) => void;
  onTranscript: (text: string) => void;
}) {
  const [recState, setRecState] = useState<VoiceRecState>("idle");
  const [recError, setRecError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);

  function resetErrorLater() {
    window.setTimeout(() => {
      setRecState("idle");
      setRecError(null);
    }, 3200);
  }

  async function finishRecording(blob: Blob) {
    setRecState("processing");
    const seconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));

    try {
      const formData = new FormData();
      formData.append("audio", blob, "exercise-lab-note.webm");
      formData.append("language", "es");
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && typeof data.text === "string" && data.text.trim()) {
        const transcript = `Voice note: ${data.text.trim()}`;
        onVoiceNote(transcript);
        onTranscript(transcript);
      } else {
        onVoiceNote(`Voice note attached (${seconds} s)`);
      }
      setRecState("idle");
    } catch {
      onVoiceNote(`Voice note attached (${seconds} s)`);
      setRecState("idle");
    }
  }

  async function startRecording() {
    setRecError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecState("error");
      setRecError("This browser can't record audio here.");
      resetErrorLater();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        void finishRecording(new Blob(chunksRef.current, { type: mime || "audio/webm" }));
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecState("recording");
    } catch {
      setRecState("error");
      setRecError("Microphone permission unavailable.");
      resetErrorLater();
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
  }

  function onMicClick() {
    if (recState === "recording") {
      stopRecording();
      return;
    }
    if (recState === "idle" || recState === "error") {
      void startRecording();
    }
  }

  return { recState, recError, onMicClick };
}
