package utils

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/smtp"
	"os"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type EmailService struct {
	SMTPHost string
	SMTPPort string
	From     string
	Password string
}

func NewEmailService() *EmailService {
	return &EmailService{
		SMTPHost: getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort: getEnv("SMTP_PORT", "465"),
		From:     getEnv("SMTP_FROM", ""),
		Password: getEnv("SMTP_PASSWORD", ""),
	}
}

func (e *EmailService) SendEmail(to, subject, body string) error {
	// Skip if email not configured
	if e.From == "" || e.Password == "" {
		log.Println("Email not configured, skipping email send")
		return nil
	}

	// Setup headers
	headers := make(map[string]string)
	headers["From"] = e.From
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=\"UTF-8\""

	// Setup message
	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body

	// Setup authentication
	auth := smtp.PlainAuth("", e.From, e.Password, e.SMTPHost)

	// Setup TLS config
	tlsConfig := &tls.Config{
		InsecureSkipVerify: false,
		ServerName:         e.SMTPHost,
	}

	// Connect to server
	conn, err := tls.Dial("tcp", e.SMTPHost+":"+e.SMTPPort, tlsConfig)
	if err != nil {
		return err
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, e.SMTPHost)
	if err != nil {
		return err
	}
	defer client.Quit()

	// Authenticate
	if err = client.Auth(auth); err != nil {
		return err
	}

	// Set sender and recipient
	if err = client.Mail(e.From); err != nil {
		return err
	}
	if err = client.Rcpt(to); err != nil {
		return err
	}

	// Send message
	w, err := client.Data()
	if err != nil {
		return err
	}
	_, err = w.Write([]byte(message))
	if err != nil {
		return err
	}
	err = w.Close()
	if err != nil {
		return err
	}

	log.Printf("Email sent successfully to %s", to)
	return nil
}

func (e *EmailService) SendStatusUpdateNotification(userEmail, userName, complaintTitle, oldStatus, newStatus string) error {
	subject := "Update Status Pengaduan - " + complaintTitle
	caser := cases.Title(language.Indonesian)

	body := fmt.Sprintf(`
		<html>
		<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
			<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
				<h2 style="color: #3B82F6;">Pengaduan Anda Diupdate</h2>
				<p>Halo <strong>%s</strong>,</p>
				<p>Status pengaduan Anda telah diperbarui:</p>
				<div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
					<p><strong>Judul Pengaduan:</strong> %s</p>
					<p><strong>Status Sebelumnya:</strong> <span style="color: #F59E0B;">%s</span></p>
					<p><strong>Status Baru:</strong> <span style="color: #10B981;">%s</span></p>
				</div>
				<p>Anda dapat melihat detail pengaduan di aplikasi.</p>
				<p>Terima kasih telah menggunakan Sistem Pengaduan Layanan Publik.</p>
				<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
				<p style="font-size: 12px; color: #666;">
					Email ini dikirim secara otomatis, mohon tidak membalas email ini.
				</p>
			</div>
		</body>
		</html>
	`, userName, complaintTitle, caser.String(oldStatus), caser.String(newStatus))

	return e.SendEmail(userEmail, subject, body)
}

func (e *EmailService) SendResponseNotification(userEmail, userName, complaintTitle, responseText string) error {
	subject := "Tanggapan Baru untuk Pengaduan - " + complaintTitle

	body := fmt.Sprintf(`
		<html>
		<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
			<div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
				<h2 style="color: #3B82F6;">Tanggapan Admin</h2>
				<p>Halo <strong>%s</strong>,</p>
				<p>Admin telah memberikan tanggapan untuk pengaduan Anda:</p>
				<div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
					<p><strong>Judul Pengaduan:</strong> %s</p>
					<p><strong>Tanggapan Admin:</strong></p>
					<p style="padding: 10px; background-color: #f3f4f6; border-left: 3px solid #3B82F6;">%s</p>
				</div>
				<p>Anda dapat melihat detail lengkap di aplikasi.</p>
				<p>Terima kasih telah menggunakan Sistem Pengaduan Layanan Publik.</p>
				<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
				<p style="font-size: 12px; color: #666;">
					Email ini dikirim secara otomatis, mohon tidak membalas email ini.
				</p>
			</div>
		</body>
		</html>
	`, userName, complaintTitle, responseText)

	return e.SendEmail(userEmail, subject, body)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
