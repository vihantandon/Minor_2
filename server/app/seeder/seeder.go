package seeder

import (
	"encoding/csv"
	"os"
	"strconv"

	"olympiad/app/entity"

	"go.uber.org/zap"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type csvRow struct {
	ID       string
	Problem  string
	Solution string
	Answer   string
	Subject  string
	Level    string
}

func SeedQuestions(db *gorm.DB, sugar *zap.SugaredLogger, csvPath string) error {
	f, err := os.Open(csvPath)
	if err != nil {
		return err
	}
	defer f.Close()

	reader := csv.NewReader(f)
	records, err := reader.ReadAll()
	if err != nil {
		return err
	}

	// Skip header row
	if len(records) == 0 {
		sugar.Warn("CSV is empty, nothing to seed")
		return nil
	}
	records = records[1:]

	// Build batch
	var questions []entity.QnA
	for _, rec := range records {
		// CSV columns: id, problem, solution, answer, subject, level, unique_id
		if len(rec) < 7 {
			continue
		}

		level, err := strconv.Atoi(rec[5])
		if err != nil {
			continue
		}

		uid, err := strconv.ParseUint(rec[6], 10, 32)
		if err != nil {
			uid = 0
		}

		q := entity.QnA{
			Unique_ID:  uint32(uid),
			Question:   rec[1],
			Solution:   rec[2],
			Answer:     []byte(rec[3]),
			Topic:      rec[4],
			Difficulty: entity.LeveltoDifficulty(level),
			Q_type:     entity.NUMERICAL, // dataset answers are numeric/short
		}
		questions = append(questions, q)
	}

	// Bulk upsert — skip duplicates on Unique_ID
	result := db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "question"}},
		DoNothing: true,
	}).CreateInBatches(questions, 500)
	if result.Error != nil {
		return result.Error
	}

	sugar.Infof("Seeded %d questions from %s", result.RowsAffected, csvPath)
	return nil
}
