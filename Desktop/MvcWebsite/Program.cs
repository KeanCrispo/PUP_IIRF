var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

var app = builder.Build();

// serve files from wwwroot
app.UseStaticFiles(); // Ensure this is present to serve static files

// Add logging for static file requests
app.Use(async (context, next) =>
{
    await next.Invoke();
    if (context.Response.StatusCode == 404 && 
        !Path.HasExtension(context.Request.Path.Value) && 
        !context.Request.Path.Value.StartsWith("/api"))
    {
        // Log the missing file request
        Console.WriteLine($"File not found: {context.Request.Path}");
    }
});

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
