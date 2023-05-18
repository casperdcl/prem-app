import { useCallback, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import { shallow } from "zustand/shallow";
import { Message, PremChatResponse } from "modules/prem-chat/types";
import { getChatCompletion } from "modules/prem-chat/api";
import usePremChatStore from "../store/prem-chat";

const usePremChatWithoutStream = (chatId: string | null): PremChatResponse => {
  const [question, setQuestion] = useState("");
  const [tempQuestion, setTempQuestion] = useState("");
  const navigate = useNavigate();

  const {
    model,
    history,
    addHistory,
    updateHistoryMessages,
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
  } = usePremChatStore(
    (state) => ({
      model: state.model,
      history: state.history,
      addHistory: state.addHistory,
      updateHistoryMessages: state.updateHistoryMessages,
      temperature: state.temperature,
      max_tokens: state.max_tokens,
      top_p: state.top_p,
      frequency_penalty: state.frequency_penalty,
    }),
    shallow
  );

  const messages =
    history.find((_history) => _history.id === chatId)?.messages || [];

  const { isLoading, isError, mutate } = useMutation(
    (messages: Message[]) =>
      getChatCompletion({
        messages,
        model,
        temperature,
        max_tokens,
        top_p,
        frequency_penalty,
      }),
    {
      onSuccess: (response) => {
        const tempConversation = [
          {
            role: "user",
            content: tempQuestion,
          },
          {
            role: "assistant",
            content: response.data.choices[0].message.content,
          },
        ];
        if (!chatId) {
          const newConversationId = uuid();
          addHistory({
            id: newConversationId,
            model,
            title: tempConversation[0].content,
            messages: [...tempConversation],
            timestamp: Date.now(),
          });
          navigate(`/prem-chat/${newConversationId}`);
        } else {
          updateHistoryMessages(chatId, [...messages, ...tempConversation]);
        }
        setTempQuestion("");
      },
    }
  );

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      processQuestion(question);
    },
    [question]
  );

  const processQuestion = (question: string) => {
    const query = question.trim();
    if (!query) {
      return;
    }
    const newMessages = [...messages, { role: "user", content: query }];
    setQuestion("");
    setTempQuestion(query);
    mutate(newMessages);
  };

  const chatMessages = useMemo(() => {
    if (tempQuestion) {
      return [...messages, { role: "user", content: tempQuestion }];
    }
    return messages;
  }, [messages, tempQuestion]);

  const onRegenerate = useCallback(() => {
    const newMessages = [...messages];
    const lastConversation = newMessages.splice(-2);
    if (chatId) {
      updateHistoryMessages(chatId, newMessages);
      processQuestion(lastConversation[0].content);
    }
  }, [messages]);

  return {
    chatMessages: chatMessages,
    onSubmit,
    question,
    setQuestion,
    isLoading,
    isError,
    onRegenerate,
  };
};

export default usePremChatWithoutStream;
