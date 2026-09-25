/// The farming assistant.
///
/// Distinct from the web app's `/api/chat`, which matches keywords against a
/// hardcoded FAQ and answers "call our expert" for anything it does not
/// recognise. This one puts the question to a real model with the farmer's
/// own district and crops attached, so the answer is about their field.
library;

enum Sender { farmer, assistant }

class ChatMessage {
  const ChatMessage({
    required this.sender,
    required this.text,
    this.failed = false,
  });

  final Sender sender;
  final String text;

  /// The request did not come back. Kept in the thread rather than removed,
  /// so the farmer can see what they asked and try it again.
  final bool failed;

  bool get isFarmer => sender == Sender.farmer;

  /// The wire role the route expects.
  String get role => isFarmer ? 'user' : 'model';

  Map<String, dynamic> toHistoryJson() => {'role': role, 'text': text};
}

/// Trims a thread to the turns worth sending back as context.
///
/// The route caps history itself, but sending the whole conversation from a
/// phone wastes the farmer's data on turns the model will discard. Failed
/// messages are dropped: they have no answer, and a question with no reply
/// in the history reads to the model as one it already handled.
List<Map<String, dynamic>> historyFor(
  List<ChatMessage> messages, {
  int maxTurns = 8,
}) {
  final usable = messages.where((m) => !m.failed && m.text.trim().isNotEmpty);
  final recent = usable.length <= maxTurns
      ? usable.toList()
      : usable.skip(usable.length - maxTurns).toList();

  // A thread must start with the farmer, or the model rejects the history.
  final start = recent.indexWhere((m) => m.isFarmer);
  if (start < 0) return const [];

  return recent.skip(start).map((m) => m.toHistoryJson()).toList();
}
