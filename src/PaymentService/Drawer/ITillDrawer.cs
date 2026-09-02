using PaymentService.DTOs;
using PaymentService.Entities;

namespace PaymentService.Drawer;

public interface ITillDrawer
{
    Task<TillStamp> CaptureAsync(Till till, ChargeDeskDto? desk, CancellationToken cancellationToken);
}
