import { describe, it, expect } from 'vitest';
import { parseDate, formatDate, addDays } from '../../src/util/date';
import { format, isEqual, addDays as dateAdd } from 'date-fns';

describe('parseDate', () => {
  const testCases = [
    { input: '20230101', expected: new Date(2023, 0, 1), description: '新年' },
    { input: '20240229', expected: new Date(2024, 1, 29), description: 'うるう年' },
    { input: '20230228', expected: new Date(2023, 1, 28), description: '非うるう年の2月' },
    { input: '20231231', expected: new Date(2023, 11, 31), description: '年末' },
    { input: '20230401', expected: new Date(2023, 3, 1), description: '4月1日' },
    { input: '20230930', expected: new Date(2023, 8, 30), description: '9月末' },
    { input: '20220501', expected: new Date(2022, 4, 1), description: '過去の日付' },
    { input: '20300615', expected: new Date(2030, 5, 15), description: '未来の日付' },
  ];

  it.each(testCases)('$description: "$input" を正しく解析する', ({ input, expected }) => {
    const result = parseDate(input);
    expect(isEqual(result, expected)).toBe(true);
    expect(format(result, 'yyyy-MM-dd')).toBe(format(expected, 'yyyy-MM-dd'));
  });

  it('時刻コンポーネントが0に設定されることを確認する', () => {
    const result = parseDate('20230101');
    expect(format(result, 'HH:mm:ss.SSS')).toBe('00:00:00.000');
  });
});

describe('formatDate', () => {
  const testCases = [
    { input: new Date(2023, 0, 1), expected: '20230101', description: '新年' },
    { input: new Date(2024, 1, 29), expected: '20240229', description: 'うるう年' },
    { input: new Date(2023, 1, 28), expected: '20230228', description: '非うるう年の2月' },
    { input: new Date(2023, 11, 31), expected: '20231231', description: '年末' },
    { input: new Date(2023, 3, 1), expected: '20230401', description: '4月1日' },
    { input: new Date(2023, 8, 30), expected: '20230930', description: '9月末' },
    { input: new Date(2023, 0, 9), expected: '20230109', description: '1桁の日（パディング）' },
    { input: new Date(2023, 5, 5), expected: '20230605', description: '1桁の月（パディング）' },
    { input: new Date(2023, 5, 7), expected: '20230607', description: '1桁の月・日（パディング）' },
  ];

  it.each(testCases)('$description: $input を "$expected" にフォーマットする', ({ input, expected }) => {
    const result = formatDate(input);
    expect(result).toBe(expected);
  });
});

describe('addDays', () => {
  const testCases = [
    { base: new Date(2023, 0, 1), days: 5, expected: new Date(2023, 0, 6), description: '通常の加算' },
    { base: new Date(2023, 0, 31), days: 1, expected: new Date(2023, 1, 1), description: '月をまたぐ加算' },
    { base: new Date(2023, 1, 1), days: -2, expected: new Date(2023, 0, 30), description: '負の日数の加算' },
    { base: new Date(2023, 11, 31), days: 1, expected: new Date(2024, 0, 1), description: '年をまたぐ加算' },
    { base: new Date(2024, 1, 28), days: 1, expected: new Date(2024, 1, 29), description: 'うるう年の加算' },
    { base: new Date(2023, 1, 28), days: 1, expected: new Date(2023, 2, 1), description: '非うるう年の加算' },
    { base: new Date(2023, 5, 30), days: 31, expected: new Date(2023, 6, 31), description: '複数月をまたぐ加算' },
    { base: new Date(2023, 0, 15), days: 0, expected: new Date(2023, 0, 15), description: '0日の加算（変化なし）' },
    { base: new Date(2023, 0, 1), days: 365, expected: new Date(2024, 0, 1), description: '1年の加算' },
  ];

  it.each(testCases)('$description: $base に $days 日を加算すると $expected になる', ({ base, days, expected }) => {
    const result = addDays(base, days);
    const dateAddResult = dateAdd(new Date(base), days);
    expect(isEqual(result, expected)).toBe(true);
    expect(isEqual(result, dateAddResult)).toBe(true);
    expect(format(result, 'yyyy-MM-dd')).toBe(format(expected, 'yyyy-MM-dd'));
  });
});