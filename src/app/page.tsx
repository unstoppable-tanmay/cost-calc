"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

type People = {
  name: string;
  checked: boolean;
};

type Expenses = {
  name: string;
  [key: string]: number | string;
};

const CostCalc = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [initialLoad, setInitialLoad] = React.useState(true);

  const getQueryParams = (param: string) => {
    return searchParams.get(param) as string | undefined;
  };

  const [people, setPeople] = React.useState<People[]>(() => {
    const savedPeople =
      getQueryParams("people") || localStorage.getItem("people");
    return savedPeople ? JSON.parse(savedPeople) : [];
  });

  const [expenses, setExpenses] = React.useState<Expenses[]>(() => {
    const savedExpenses =
      getQueryParams("expenses") || localStorage.getItem("expenses");
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  const updateURLParams = (key: string, value: People[] | Expenses[]) => {
    const params = new URLSearchParams(window.location.search);
    params.set(key, JSON.stringify(value));
    router.replace(`?${params.toString()}`, undefined);
  };

  React.useEffect(() => {
    if (!initialLoad) {
      const savedPeople = getQueryParams("people");
      const savedExpenses = getQueryParams("expenses");
      if (savedPeople) {
        setPeople(JSON.parse(savedPeople));
      }
      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      }

      if (people.length > 0) {
        localStorage.setItem("people", JSON.stringify(savedPeople));
      }
      if (expenses.length > 0) {
        localStorage.setItem("expenses", JSON.stringify(savedExpenses));
      }
    }
    console.log("initialLoad");
    setInitialLoad(true);
  }, []);

  React.useEffect(() => {
    if (!initialLoad && people.length > 0) {
      localStorage.setItem("people", JSON.stringify(people));
      updateURLParams("people", people);
    }
    console.log("people");
  }, [people]);

  React.useEffect(() => {
    if (!initialLoad && expenses.length > 0) {
      localStorage.setItem("expenses", JSON.stringify(expenses));
      updateURLParams("expenses", expenses);
    }
    console.log("expenses");
  }, [expenses]);

  const clearData = () => {
    setPeople([]);
    setExpenses([]);
    localStorage.removeItem("people");
    localStorage.removeItem("expenses");
    updateURLParams("people", []);
    updateURLParams("expenses", []);
  };

  const [showAddPersonModal, setShowAddPersonModal] = React.useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = React.useState(false);
  const [newPersonName, setNewPersonName] = React.useState("");
  const [newExpenseName, setNewExpenseName] = React.useState("");
  const [newExpenseAmounts, setNewExpenseAmounts] = React.useState<
    Record<string, number>
  >({});
  const [editExpenseIndex, setEditExpenseIndex] = React.useState<number | null>(
    null
  );

  const addPerson = () => {
    if (newPersonName) {
      setPeople((prev) => [
        ...prev,
        {
          name: newPersonName,
          checked: false,
        },
      ]);
      setNewPersonName("");
      setShowAddPersonModal(false);
    }
  };

  const addExpense = () => {
    if (newExpenseName) {
      const newExpense: Expenses = {
        name: newExpenseName,
        ...people.reduce((acc, person) => {
          acc[person.name] = newExpenseAmounts[person.name] || 0;
          return acc;
        }, {} as Record<string, number>),
      };
      if (editExpenseIndex !== null) {
        setExpenses((prev) => {
          const updatedExpenses = [...prev];
          updatedExpenses[editExpenseIndex] = newExpense;
          return updatedExpenses;
        });
        setEditExpenseIndex(null);
      } else {
        setExpenses((prev) => [...prev, newExpense]);
      }
      setNewExpenseName("");
      setNewExpenseAmounts({});
      setShowAddExpenseModal(false);
    }
  };

  const editExpense = (index: number) => {
    const expenseToEdit = expenses[index];
    setNewExpenseName(expenseToEdit.name as string);
    setNewExpenseAmounts(
      people.reduce((acc, person) => {
        acc[person.name] = expenseToEdit[person.name] as number;
        return acc;
      }, {} as Record<string, number>)
    );
    setEditExpenseIndex(index);
    setShowAddExpenseModal(true);
  };

  const [distribute, setDistribute] = React.useState(false);
  const [distributeAmount, setDistributeAmount] = React.useState(0);

  React.useEffect(() => {
    if (!showAddPersonModal) {
      setNewPersonName("");
    }
  }, [showAddPersonModal]);

  React.useEffect(() => {
    if (!showAddExpenseModal) {
      setNewExpenseName("");
      setNewExpenseAmounts({});
      setDistribute(false);
      setDistributeAmount(0);
      setEditExpenseIndex(null);
      setPeople((prev) =>
        prev.map((person) => ({
          ...person,
          checked: false,
        }))
      );
    }
  }, [showAddExpenseModal]);

  return (
    <div className="flex w-screen h-screen items-center justify-center flex-col bg-gray-100 gap-3">
      {showAddPersonModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 transition-opacity duration-300">
          <div className="bg-white w-[clamp(200px,400px,90vw)] p-5 pt-3 pb-4 rounded shadow-lg transform transition-transform duration-300">
            <div className="flex gap-2 items-center justify-between mb-5">
              <h2 className="text-xl">Add Person</h2>
              <button
                onClick={() => setShowAddPersonModal(false)}
                className="text-red-500 hover:text-red-700 font-bold text-2xl transition duration-300"
              >
                &times;
              </button>
            </div>
            <div className="flex gap-2 items-center mb-2">
              <input
                type="text"
                placeholder="Name"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                className="border p-1.5 rounded w-[clamp(100px,80%,80vw)]"
              />
              <button
                onClick={addPerson}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded transition duration-300"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddExpenseModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 transition-opacity duration-300">
          <div className="bg-white w-[clamp(200px,650px,90vw)] p-6 rounded shadow-lg transform transition-transform duration-300 flex flex-col max-h-[80vh] overflow-y-scroll">
            <div className="flex gap-2 items-center justify-between mb-5">
              <h2 className="text-xl">Add Expense</h2>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="text-red-500 hover:text-red-700 font-bold text-2xl transition duration-300"
              >
                &times;
              </button>
            </div>
            <div className="flex gap-2 items-end">
              <input
                type="text"
                placeholder="Expense Name"
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
                className="border p-1.5 mb-4 w-full rounded"
              />
              <div className="flex flex-col">
                <div className="flex justify-end">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="distribute"
                      className="mr-2"
                      checked={distribute}
                      onChange={(e) => {
                        setDistribute(e.target.checked);
                        if (e.target.checked) {
                          const amount = Number(
                            (
                              distributeAmount /
                              people.filter((person) => person.checked).length
                            ).toFixed(2)
                          );
                          setNewExpenseAmounts(
                            people
                              .filter((person) => person.checked)
                              .reduce((acc, person) => {
                                acc[person.name] = amount;
                                return acc;
                              }, {} as Record<string, number>)
                          );
                        } else {
                          setNewExpenseAmounts({});
                        }
                      }}
                    />
                    <label
                      htmlFor="distribute"
                      className="text-sm font-medium text-gray-700"
                    >
                      Distribute equally
                    </label>
                  </div>
                </div>
                <input
                  type="number"
                  placeholder="Distribution"
                  value={distributeAmount || ""}
                  onChange={(e) => setDistributeAmount(Number(e.target.value))}
                  className="border p-1.5 mb-4 w-full rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
              {people.map((person) => (
                <div key={person.name} className="mb-2">
                  <div className="flex w-full items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      {person.name}
                    </label>
                    <input
                      type="checkbox"
                      checked={person.checked}
                      onChange={(e) => {
                        setPeople((prev) =>
                          prev.map((p) =>
                            p.name === person.name
                              ? { ...p, checked: e.target.checked }
                              : p
                          )
                        );
                        if (e.target.checked) {
                          const amount = Number(
                            (
                              distributeAmount /
                              people.filter(
                                (p) => p.checked || p.name === person.name
                              ).length
                            ).toFixed(2)
                          );
                          setNewExpenseAmounts(
                            people
                              .filter(
                                (p) => p.checked || p.name === person.name
                              )
                              .reduce((acc, p) => {
                                acc[p.name] = amount;
                                return acc;
                              }, {} as Record<string, number>)
                          );
                        } else {
                          setNewExpenseAmounts({});
                        }
                      }}
                      className="mr-2"
                    />
                  </div>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newExpenseAmounts[person.name] || ""}
                    onChange={(e) =>
                      setNewExpenseAmounts({
                        ...newExpenseAmounts,
                        [person.name]: Number(e.target.value),
                      })
                    }
                    className="border p-1.5 w-full rounded"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={addExpense}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="wrapper w-[clamp(100px,1600px,95vw)] overflow-hidden">
        <div className="flex justify-center md:justify-between items-center mb-6 flex-wrap gap-3">
          <div className="heading text-4xl font-semibold">Cost Calculator</div>
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={clearData}
              className="bg-red-400 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-sm transition duration-300"
            >
              Clear Data
            </button>
            <button
              onClick={() => setShowAddPersonModal(true)}
              className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-sm transition duration-300"
            >
              Add Person
            </button>
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="bg-green-400 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-sm transition duration-300"
            >
              Add Expense
            </button>
          </div>
        </div>

        <div className="w-full table-wrapper overflow-x-scroll">
          <table className="w-full divide-y divide-gray-200 bg-white shadow-md rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense
                </th>
                {people.map((person) => (
                  <th
                    key={person.name}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {person.name}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense, index) => (
                <tr key={index}>
                  <td className="px-3 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                    {expense.name}
                  </td>
                  {people.map((person) => (
                    <td
                      key={person.name}
                      className="px-3 py-1 whitespace-nowrap text-sm text-gray-500"
                    >
                      {expense[person.name] !== undefined
                        ? expense[person.name]
                        : 0}
                    </td>
                  ))}
                  <td className="px-3 py-1 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => editExpense(index)}
                      className="bg-yellow-500 w-[80px] hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-green-100">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  Total
                </td>
                {people.map((person) => (
                  <td
                    key={person.name}
                    className="px-3 py-2 whitespace-nowrap text-sm text-gray-500"
                  >
                    {expenses.reduce(
                      (acc, expense) =>
                        acc +
                        (typeof expense[person.name] === "number"
                          ? (expense[person.name] as number)
                          : 0),
                      0
                    )}
                  </td>
                ))}
                <td className="px-3 py-1 whitespace-nowrap text-sm font-medium">
                  <button className="bg-lime-500 w-[80px] hover:bg-lime-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                    Share
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CostCalc;
