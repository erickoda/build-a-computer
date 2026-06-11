package main

import (
	"go.uber.org/fx"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/app"
)

func main() {
	fx.New(
		app.Module,
	).Run()
}

