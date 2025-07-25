"use client"

import { useState, useEffect } from "react"
import { Check, X, Edit2, Filter, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { HoverEffect } from "@/components/ui/card-hover-effect"
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input"
import { FloatingNav } from "@/components/ui/floating-navbar"
import { useTheme } from "next-themes"

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
}

type FilterType = "all" | "active" | "completed"

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<FilterType>("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTodos = localStorage.getItem("todos")
    if (savedTodos) {
      setTodos(
        JSON.parse(savedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        })),
      )
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("todos", JSON.stringify(todos))
    }
  }, [todos, mounted])

  const addTodo = (text: string) => {
    if (text.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
        createdAt: new Date(),
      }
      setTodos([newTodo, ...todos])
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const startEditing = (id: string, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      setTodos(todos.map((todo) => (todo.id === editingId ? { ...todo, text: editText.trim() } : todo)))
    }
    setEditingId(null)
    setEditText("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText("")
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed
    if (filter === "completed") return todo.completed
    return true
  })

  const completedCount = todos.filter((todo) => todo.completed).length
  const activeCount = todos.length - completedCount

  const placeholders = [
    "Add a new task...",
    "What needs to be done?",
    "Plan your day...",
    "Write your next goal...",
    "Add something important...",
  ]

  const navItems = [
    {
      name: "All",
      link: "#",
      icon: <Filter className="h-4 w-4" />,
    },
  ]

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 relative overflow-hidden">
      <BackgroundBeams />

      <FloatingNav navItems={navItems} />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Todo Master
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Organize your life with style and efficiency</p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge variant="secondary" className="text-sm">
              {activeCount} active
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {completedCount} completed
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Add Todo Input */}
        <div className="mb-8">
          <PlaceholdersAndVanishInput placeholders={placeholders} onChange={() => {}} onSubmit={addTodo} />
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-2 mb-8">
          {(["all", "active", "completed"] as FilterType[]).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              onClick={() => setFilter(filterType)}
              className="capitalize"
            >
              {filterType}
            </Button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          {filteredTodos.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-slate-500 dark:text-slate-400">
                    {filter === "all"
                      ? "No tasks yet. Add one above!"
                      : filter === "active"
                        ? "No active tasks!"
                        : "No completed tasks!"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <HoverEffect
              items={filteredTodos.map((todo) => ({
                id: todo.id,
                title: todo.text,
                description: `Created ${todo.createdAt.toLocaleDateString()}`,
                completed: todo.completed,
              }))}
              className="grid-cols-1"
              renderItem={(item) => {
                const todo = filteredTodos.find((t) => t.id === item.id)!
                return (
                  <Card className={`transition-all duration-300 ${todo.completed ? "opacity-75" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodo(todo.id)}
                          className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                        />

                        {editingId === todo.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <Input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit()
                                if (e.key === "Escape") cancelEdit()
                              }}
                              className="flex-1"
                              autoFocus
                            />
                            <Button size="sm" onClick={saveEdit}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <p
                                className={`${todo.completed ? "line-through text-slate-500" : ""} transition-all duration-200`}
                              >
                                {todo.text}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {todo.createdAt.toLocaleDateString()} at {todo.createdAt.toLocaleTimeString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditing(todo.id, todo.text)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteTodo(todo.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              }}
            />
          )}
        </div>

        {/* Stats */}
        {todos.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              {completedCount > 0 && (
                <span>
                  Great job! You've completed {completedCount} out of {todos.length} tasks.
                </span>
              )}
              {completedCount === todos.length && todos.length > 0 && (
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  🎉 All tasks completed! You're amazing!
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
