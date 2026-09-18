import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  DEFAULT_HISTORY,
  DEFAULT_MIXED_MATRIX,
  DEFAULT_PARAMS,
  PRESETS,
} from '../model/params.js';
import { analyze, frequencyFromHistory } from '../model/engine.js';

const LabContext = createContext(null);

function cloneMatrix(m) {
  return m.map((row) => [...row]);
}

export function LabProvider({ children }) {
  const [params, setParamsState] = useState(DEFAULT_PARAMS);
  const [history, setHistoryState] = useState(DEFAULT_HISTORY);
  const [mixedMatrix, setMixedMatrixState] = useState(() => cloneMatrix(DEFAULT_MIXED_MATRIX));
  const [gameOverride, setGameOverride] = useState(null);

  const result = useMemo(
    () => analyze({ params, history, mixedMatrix, gameOverride }),
    [params, history, mixedMatrix, gameOverride],
  );

  const patchParams = useCallback((patch) => {
    setParamsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setPS1 = useCallback((pS1) => {
    const clamped = Math.min(1, Math.max(0, pS1));
    setParamsState((prev) => ({ ...prev, pS1: clamped }));
  }, []);

  const updateHistoryRow = useCallback((month, patch) => {
    setHistoryState((prev) => {
      const next = prev.map((row) => (row.month === month ? { ...row, ...patch } : row));
      setParamsState((p) => ({ ...p, pS1: frequencyFromHistory(next, p).pS1 }));
      return next;
    });
  }, []);

  const setMixedCell = useCallback((i, j, value) => {
    setMixedMatrixState((prev) => {
      const next = cloneMatrix(prev);
      next[i][j] = value;
      return next;
    });
  }, []);

  const setGameCell = useCallback((i, j, value) => {
    setGameOverride((prev) => {
      const base = prev ?? result.matrix;
      const next = cloneMatrix(base);
      next[i][j] = value;
      return next;
    });
  }, [result.matrix]);

  const syncGameFromLab = useCallback(() => {
    setGameOverride(null);
  }, []);

  const reset = useCallback(() => {
    setParamsState(DEFAULT_PARAMS);
    setHistoryState(DEFAULT_HISTORY);
    setMixedMatrixState(cloneMatrix(DEFAULT_MIXED_MATRIX));
    setGameOverride(null);
  }, []);

  const applyPreset = useCallback((key) => {
    const preset = PRESETS[key];
    if (!preset) return;
    setParamsState((prev) => ({ ...prev, ...preset.params }));
  }, []);

  const value = useMemo(
    () => ({
      params,
      patchParams,
      setPS1,
      history,
      updateHistoryRow,
      mixedMatrix,
      setMixedCell,
      gameOverride,
      setGameCell,
      syncGameFromLab,
      reset,
      applyPreset,
      result,
    }),
    [
      params,
      patchParams,
      setPS1,
      history,
      updateHistoryRow,
      mixedMatrix,
      setMixedCell,
      gameOverride,
      setGameCell,
      syncGameFromLab,
      reset,
      applyPreset,
      result,
    ],
  );

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab() {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error('useLab debe usarse dentro de LabProvider');
  return ctx;
}
