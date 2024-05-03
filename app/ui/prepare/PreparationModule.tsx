'use client';

import React from 'react';
import { ArrowRight, Printer, SpinnerGap } from '@phosphor-icons/react';
import { useState } from 'react';
import SearchSuggester from './SearchSuggester';

export function PreparationModule() {
  const [type, setType] = useState<string>('');
  const [situation, setSituation] = useState<string>('');
  const [concerns, setConcerns] = useState<string>('');
  const [history, setHistory] = useState<string>('');
  const [questions, setQuestions] = useState<string>('');
  const [searches, setSearches] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (
    event:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, situation, concerns, history }),
      });

      const data = await response.json(); // Parse response body as JSON

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const output = JSON.parse(data.output);

      console.log('data', data);
      console.log('output', output);

      const questionsString = output.questions
        .map(
          (question: string, index: number) => `${index + 1}. ${question}\n\n`,
        )
        .join('');

      setQuestions(questionsString);
      setSearches(output.searches);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printableWindow = window.open('', '_blank');

    if (printableWindow) {
      printableWindow.document.write('<html><head><title>Print</title>');
      printableWindow.document.write('<style>');
      printableWindow.document.write('body { margin: 20px; font-size: 16px; }');
      printableWindow.document.write('pre { white-space: pre-wrap; }');
      printableWindow.document.write('</style>');
      printableWindow.document.write('</head><body>');
      printableWindow.document.write('<pre>' + questions + '</pre>');
      printableWindow.document.write('</body></html>');

      printableWindow.document.close();
      printableWindow.print();
    }
  };

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      <div>
        {questions === '' ? (
          <form onSubmit={handleSubmit}>
            <div className="font-semibold text-gray-600">
              Type of appointment:
            </div>
            <input
              type="text"
              id="type"
              name="type"
              className="mb-6 rounded-lg border border-gray-300"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />

            <div className="font-semibold text-gray-600">Situation:</div>
            <textarea
              id="situation"
              name="situation"
              className="mb-6 h-24 w-full rounded-lg border border-gray-300"
              placeholder="Describe your current health concern or symptoms. What prompted you to schedule this appointment?"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
            ></textarea>

            <div className="font-semibold text-gray-600">
              Expectations and Concerns
            </div>
            <textarea
              id="concerns"
              name="concerns"
              className="mb-6 h-24 w-full rounded-lg border border-gray-300"
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder={`What would you like to get out of the appointment? Are there specific concerns or questions you want to address with your doctor?`}
            ></textarea>

            <div className="font-semibold text-gray-600">
              Treatment and Medication History
            </div>
            <textarea
              id="history"
              name="history"
              className="mb-6 h-24 w-full rounded-lg border border-gray-300"
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              placeholder={`Information on any current medications you're taking, including dosage and frequency. Have you tried any treatments or interventions for your current health concern?`}
            ></textarea>

            <div className="flex w-full flex-row justify-end">
              {!loading ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex h-10 items-center rounded-lg bg-teal-600 px-4 text-sm font-medium text-white transition-colors hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <span className="">Generate questions</span>{' '}
                  <ArrowRight size={28} className="h-5 md:ml-4" />
                </button>
              ) : (
                <div
                  className={`flex h-10 items-center rounded-lg border bg-gray-50 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100`}
                >
                  <span>Generating questions</span>{' '}
                  {/* <SpinnerGap className="h-5 md:ml-4" /> */}
                </div>
              )}
            </div>
          </form>
        ) : (
          <div>
            <SearchSuggester searches={searches} />
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex flex-row items-center justify-between">
          <div className="font-semibold text-gray-600">
            Questions to ask at your upcoming appointment:
          </div>
          <div className="hidden lg:block">
            {questions === '' ? (
              <div className="flex flex-row rounded-lg border p-2 transition-all">
                <div className="mr-1 text-sm font-semibold">PRINT</div>
                <Printer size={22} />
              </div>
            ) : (
              <button
                className="flex cursor-pointer flex-row rounded-lg border bg-teal-600 p-2 transition-all"
                onClick={handlePrint}
              >
                <div className="mr-1 text-sm font-semibold text-white">
                  PRINT
                </div>
                <Printer size={22} color="white" />
              </button>
            )}
          </div>
        </div>
        <textarea
          id="questions"
          name="questions"
          className="h-[34rem] w-full rounded-lg border border-gray-300"
          placeholder="AI generated questions will appear here."
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
        ></textarea>
      </div>
    </div>
  );
}
