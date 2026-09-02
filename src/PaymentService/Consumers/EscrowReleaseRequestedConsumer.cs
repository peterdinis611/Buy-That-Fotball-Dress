using Contracts;
using MassTransit;
using PaymentService.Services;

namespace PaymentService.Consumers;

public class EscrowReleaseRequestedConsumer(
    ITillsService tills,
    ILogger<EscrowReleaseRequestedConsumer> logger) : IConsumer<EscrowReleaseRequested>
{
    public async Task Consume(ConsumeContext<EscrowReleaseRequested> context)
    {
        var result = await tills.ReleaseAsync(context.Message.SettlementId, context.CancellationToken);
        if (!result.IsSuccess)
        {
            logger.LogWarning(
                "Escrow release for desk {Id} did not go through: {Error}",
                context.Message.SettlementId,
                result.Error);
            return;
        }

        logger.LogInformation("Released hammer for desk {Id}", context.Message.SettlementId);
    }
}
