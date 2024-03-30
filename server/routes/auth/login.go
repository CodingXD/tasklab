package auth

import (
	"context"
	"log"
	"strings"
	"tasklab/database"
	"tasklab/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

func Login(c *fiber.Ctx) error {
	// getting body values
	v := new(struct {
		Email    string `json:"email" validate:"required,email"`
		Password string `json:"password" validate:"required,min=8"`
	})
	if err := c.BodyParser(v); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	// Validation
	if err := utils.ValidateStruct(v); len(err) != 0 {
		return c.Status(fiber.StatusBadRequest).JSON(err)
	}

	// getting db instance
	db, err := database.GetDB()
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()

	// checking if user exists
	var id, password, role string
	err = db.QueryRow(context.Background(), "SELECT id, password, role FROM user WHERE email = $1", strings.ToLower(v.Email)).Scan(&id, &password, &role)
	if err != nil {
		if err == pgx.ErrNoRows {
			fiber.ErrBadRequest.Message = "Account not found"
			return fiber.ErrBadRequest
		}
		return err
	}

	// check if password match
	err = bcrypt.CompareHashAndPassword([]byte(password), []byte(v.Password))
	if err != nil {
		fiber.ErrBadRequest.Message = "Email/Password is incorrect"
		return fiber.ErrBadRequest
	}

	type Response struct {
		Id    string `json:"id"`
		Email string `json:"email"`
		Role  string `json:"role"`
	}

	return c.JSON(Response{
		Id:    id,
		Email: strings.ToLower(v.Email),
		Role:  role,
	})
}
