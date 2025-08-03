// index.js ou server.js
import express from 'express';
import emailjs from '@emailjs/nodejs';

const app = express();
app.use(express.json());
const PORT = 3000;

// (Opcional) inicializar globalmente
emailjs.init({
  publicKey: 'Nkuaj8AB47C4YI315',
  privateKey: 'LOjVXYNrVnBtu0DPGsuVC',
});

// Endpoint que recebe o agendamento e envia e-mail
app.post('/agendar', async (req, res) => {
  const { nome, email, horario, instrumento } = req.body;
  if (!nome || !email || !horario || !instrumento) {
    return res.status(400).json({ success: false, message: 'Dados incompletos.' });
  }

  try {
    await emailjs.send(
      'SEU_SERVICE_ID',
      'SEU_TEMPLATE_ID',
      { to_name: nome, to_email: email, horario, instrumento },
      {
        publicKey: 'Nkuaj8AB47C4YI315',
        privateKey: 'LOjVXYNrVnBtu0DPGsuVC'
      }
    );

    return res.json({ success: true, message: 'E-mail enviado com sucesso!' });
  } catch (err) {
    console.error('Erro EmailJS:', err);
    return res.status(500).json({ success: false, message: 'Erro ao enviar e-mail.' });
  }
});

app.listen(PORT, () => console.log(`Server rodando na porta ${PORT}`));
