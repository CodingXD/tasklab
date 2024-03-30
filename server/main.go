package main

import (
	"os"

	a "tasklab/routes/auth"
	t "tasklab/routes/task"
	u "tasklab/routes/user"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: os.Getenv("ORIGINS"),
		AllowMethods: "GET,POST,PUT,DELETE",
	}))
	app.Use(logger.New())

	// auth routes
	auth := app.Group("/auth")
	auth.Post("/login", a.Login)
	auth.Post("/create-account", a.CreateAccount)

	// task routes
	task := app.Group("/task")
	task.Post("/create", t.CreateTask)
	task.Get("/list", t.ListTasks)
	task.Put("/edit", t.EditTask)
	task.Delete("/:id", t.DeleteTask)

	// user routes
	user := app.Group("/user")
	user.Get("/find", u.FindUsers)

	app.Listen(":3000")
}
