using Login.Models;
using Login.ViewModel;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Login.Controllers
{
    [Authorize]
    public class BookingController : Controller
    {
        private readonly BloodlineDnaContext _context;
        private readonly ILogger<BookingController> _logger;

        public BookingController(BloodlineDnaContext context, ILogger<BookingController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Bước 1: Nhận danh sách dịch vụ JSON từ giỏ hàng
        [HttpPost]
        public IActionResult StartBooking(string jsonCart)
        {
            if (string.IsNullOrEmpty(jsonCart))
                return RedirectToAction("ViewCart", "Cart");

            TempData["jsonCart"] = jsonCart;
            return RedirectToAction("FillBookingForm");
        }

        public IActionResult FillBookingForm()
        {
            var jsonCart = TempData["jsonCart"] as string;
            if (string.IsNullOrEmpty(jsonCart))
                return RedirectToAction("ViewCart", "Cart");

            var services = JsonConvert.DeserializeObject<List<BookingViewModel>>(jsonCart);

            // Lấy giá dịch vụ
            var servicePrices = _context.ServicePrices
                .Where(sp => services.Select(m => m.SelectedServiceId).Contains(sp.ServicePackageId))
                .ToList();

            // Gán giá cho từng dịch vụ
            foreach (var service in services)
            {
                service.Price = servicePrices.FirstOrDefault(sp => sp.ServicePackageId == service.SelectedServiceId)?.Price ?? 0;
            }

            // Lấy danh sách SampleTypes từ database
            ViewBag.SampleTypes = _context.SampleTypes.ToList();

            TempData["jsonCart"] = jsonCart;
            return View(services);
        }

        [HttpPost]
        public async Task<IActionResult> FillBookingForm(List<BookingViewModel> model)
        {
            _logger.LogInformation("Starting FillBookingForm POST with {count} items", model?.Count ?? 0);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("ModelState is invalid. Errors: {errors}", 
                    string.Join(", ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)));

                // Lấy lại giá dịch vụ và sample types khi form không hợp lệ
                var servicePrices = _context.ServicePrices
                    .Where(sp => model.Select(m => m.SelectedServiceId).Contains(sp.ServicePackageId))
                    .ToList();

                foreach (var service in model)
                {
                    service.Price = servicePrices.FirstOrDefault(sp => sp.ServicePackageId == service.SelectedServiceId)?.Price ?? 0;
                }

                ViewBag.SampleTypes = _context.SampleTypes.ToList();
                return View(model);
            }

            // Kiểm tra bổ sung và validate SampleType
            try 
            {
                for (int i = 0; i < model.Count; i++)
                {
                    var booking = model[i];
                    
                    // Validate SampleType exists in database
                    var sampleTypeExists = await _context.SampleTypes
                        .AnyAsync(st => st.Name == booking.SampleType);
                    
                    if (!sampleTypeExists)
                    {
                        _logger.LogError("Invalid SampleType: {sampleType} for booking index {index}", 
                            booking.SampleType, i);
                        ModelState.AddModelError($"[{i}].SampleType", "Loại mẫu không hợp lệ.");
                    }

                    if (string.IsNullOrWhiteSpace(booking.Relationship))
                    {
                        ModelState.AddModelError($"[{i}].Relationship", "Vui lòng chọn mối quan hệ.");
                    }
                    if (string.IsNullOrWhiteSpace(booking.Name))
                    {
                        ModelState.AddModelError($"[{i}].Name", "Vui lòng nhập tên người liên quan.");
                    }
                }

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Additional validation failed. Errors: {errors}",
                        string.Join(", ", ModelState.Values
                            .SelectMany(v => v.Errors)
                            .Select(e => e.ErrorMessage)));

                    // Lấy lại giá dịch vụ và sample types khi form không hợp lệ
                    var servicePrices = _context.ServicePrices
                        .Where(sp => model.Select(m => m.SelectedServiceId).Contains(sp.ServicePackageId))
                        .ToList();

                    foreach (var service in model)
                    {
                        service.Price = servicePrices.FirstOrDefault(sp => sp.ServicePackageId == service.SelectedServiceId)?.Price ?? 0;
                    }

                    ViewBag.SampleTypes = _context.SampleTypes.ToList();
                    return View(model);
                }

                // Lưu thông tin form vào TempData
                TempData["BookingData"] = JsonConvert.SerializeObject(model);
                _logger.LogInformation("Successfully validated and saved booking data to TempData");

                return RedirectToAction("Payment");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while processing FillBookingForm");
                ModelState.AddModelError("", "Có lỗi xảy ra khi xử lý form. Vui lòng thử lại.");
                
                ViewBag.SampleTypes = _context.SampleTypes.ToList();
                return View(model);
            }
        }

        public async Task<IActionResult> Payment()
        {
            var bookingData = TempData["BookingData"] as string;
            if (string.IsNullOrEmpty(bookingData))
            {
                return RedirectToAction("ViewCart", "Cart");
            }

            var model = JsonConvert.DeserializeObject<List<BookingViewModel>>(bookingData);

            // Lấy giá dịch vụ
            var servicePrices = await _context.ServicePrices
                .Where(sp => model.Select(m => m.SelectedServiceId).Contains(sp.ServicePackageId))
                .ToListAsync();

            ViewBag.ServicePrices = servicePrices;

            // Lưu lại để có thể sử dụng trong POST action
            TempData["BookingData"] = bookingData;
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> ProcessPayment(string paymentMethod, decimal totalAmount)
        {
            var bookingData = TempData["BookingData"] as string;
            if (string.IsNullOrEmpty(bookingData))
            {
                return RedirectToAction("ViewCart", "Cart");
            }

            var model = JsonConvert.DeserializeObject<List<BookingViewModel>>(bookingData);

            // Lấy thông tin người dùng hiện tại
            var userIdClaim = User.FindFirst("UserId") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                _logger.LogError("Không tìm thấy UserId claim");
                foreach (var claim in User.Claims)
                {
                    _logger.LogInformation($"Claim Type: {claim.Type}, Value: {claim.Value}");
                }
                return RedirectToAction("Login", "Account");
            }

            _logger.LogInformation($"Found UserId claim: {userIdClaim.Type} = {userIdClaim.Value}");

            if (!int.TryParse(userIdClaim.Value, out int userId))
            {
                _logger.LogError($"Không thể chuyển đổi UserId '{userIdClaim.Value}' thành số");
                return RedirectToAction("Login", "Account");
            }

            _logger.LogInformation($"Parsed userId: {userId}");

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // Kiểm tra sự tồn tại của user
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
                    if (user == null)
                    {
                        _logger.LogError($"Không tìm thấy user với ID: {userId}");
                        return RedirectToAction("Login", "Account");
                    }

                    _logger.LogInformation($"Found user: ID={user.UserId}, Email={user.Email}");

                    // Tìm hoặc tạo phương thức thu thập mẫu trước
                    var methodName = model[0].SampleMethod;
                    var testType = await _context.TestTypes.FirstOrDefaultAsync(t => t.Name == model[0].TestType);
                    if (testType == null)
                    {
                        _logger.LogError($"Không tìm thấy loại hình xét nghiệm: {model[0].TestType}");
                        return RedirectToAction("FillBookingForm");
                    }

                    var collectionMethod = await _context.CollectionMethods
                        .FirstOrDefaultAsync(c => c.MethodName == methodName && c.TestTypeId == testType.TestTypeId);

                    if (collectionMethod == null)
                    {
                        collectionMethod = new CollectionMethod
                        {
                            MethodName = methodName ?? "",
                            TestTypeId = testType.TestTypeId,
                            Description = $"Phương thức lấy mẫu: {methodName} - Loại hình: {testType.Name}"
                        };
                        _context.CollectionMethods.Add(collectionMethod);
                        await _context.SaveChangesAsync();
                        _logger.LogInformation($"Created new collection method: {collectionMethod.CollectionMethodId}");
                    }
                    else
                    {
                        _logger.LogInformation($"Using existing collection method: {collectionMethod.CollectionMethodId}");
                    }

                    // Tạo đơn hàng mới
                    var order = new Order
                    {
                        CustomerId = user.UserId,
                        OrderStatus = "Pending",
                        CreateAt = DateTime.Now,
                        UpdateAt = DateTime.Now,
                        CollectionMethodId = collectionMethod.CollectionMethodId
                    };

                    _context.Orders.Add(order);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Created new order with ID: {order.OrderId}");

                    // Tạo chi tiết đơn hàng và mẫu cho từng dịch vụ
                    foreach (var booking in model)
                    {
                        // Tìm hoặc tạo loại mẫu trước
                        var sampleType = await _context.SampleTypes
                            .FirstOrDefaultAsync(s => s.Name == booking.SampleType);

                        if (sampleType == null)
                        {
                            sampleType = new SampleType
                            {
                                Name = booking.SampleType ?? "",
                                Description = $"Loại mẫu xét nghiệm: {booking.SampleType}"
                            };
                            _context.SampleTypes.Add(sampleType);
                            await _context.SaveChangesAsync();
                        }

                        // Tạo người tham gia
                        var participant = new Participant
                        {
                            FullName = booking.FullName ?? "",
                            NameRelation = booking.Name ?? "",
                            Relationship = booking.Relationship ?? "",
                            Phone = booking.Phone != null ? decimal.Parse(booking.Phone.Replace("-", "").Replace(" ", "")) : 0,
                            BirthDate = DateOnly.FromDateTime(booking.BirthDate),
                            Sex = booking.Sex ?? ""
                        };
                        _context.Participants.Add(participant);
                        await _context.SaveChangesAsync();

                        // Tạo chi tiết đơn hàng
                        var orderDetail = new OrderDetail
                        {
                            OrderId = order.OrderId,
                            ServicePackageId = booking.SelectedServiceId,
                            MedicalStaffId = 1 // Cần có logic phân công nhân viên y tế
                        };
                        _context.OrderDetails.Add(orderDetail);
                        await _context.SaveChangesAsync();

                        // Tạo mẫu
                        var sample = new Sample
                        {
                            ParticipantId = participant.ParticipantId,
                            SampleTypeId = sampleType.SampleTypeId,
                            StaffId = 1, // Cần có logic phân công nhân viên
                            OrderDetailId = orderDetail.OrderDetailId,
                            SampleStatus = "Pending",
                            CollectedDate = null,
                            ReceivedDate = null,
                            Note = $"Ghi chú mẫu xét nghiệm:\n" +
                                   $"- Loại hình: {booking.TestType}\n" +
                                   $"- Hình thức lấy mẫu: {booking.SampleMethod}\n" +
                                   $"- Loại mẫu: {booking.SampleType}"
                        };
                        _context.Samples.Add(sample);
                        await _context.SaveChangesAsync();
                    }

                    // Tạo thanh toán
                    var payment = new Payment
                    {
                        OrderId = order.OrderId,
                        PaymentMethod = paymentMethod,
                        PaymentStatus = "Pending",
                        PaymentDate = DateTime.Now,
                        Total = (int)totalAmount
                    };
                    _context.Payments.Add(payment);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    // Lưu thông tin để hiển thị ở trang success
                    TempData["PaymentMethod"] = paymentMethod;
                    TempData["OrderId"] = order.OrderId;
                    TempData["SuccessMessage"] = "Đơn hàng đã được tạo thành công!";

                    return RedirectToAction("BookingSuccess");
                }
                catch (DbUpdateException dbEx)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError($"Database Update Error: {dbEx.Message}");
                    ModelState.AddModelError("", $"Lỗi khi cập nhật database: {dbEx.Message}");
                    return RedirectToAction("Payment");
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError($"Error: {ex.Message}");
                    ModelState.AddModelError("", $"Lỗi khi lưu đơn hàng: {ex.Message}");
                    return RedirectToAction("Payment");
                }
            }
        }

        public IActionResult BookingSuccess()
        {
            var successMessage = TempData["SuccessMessage"] as string;
            if (string.IsNullOrEmpty(successMessage))
            {
                return RedirectToAction("Index", "Home");
            }
            ViewBag.SuccessMessage = successMessage;
            ViewBag.PaymentMethod = TempData["PaymentMethod"];
            ViewBag.OrderId = TempData["OrderId"];
            return View();
        }
    }
}