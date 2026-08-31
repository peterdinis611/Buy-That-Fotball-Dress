using PaymentService.Entities;

namespace PaymentService.Drawer;

public interface ITillDrawer
{
    Task<string> CaptureAsync(Till till, CancellationToken cancellationToken);
}
